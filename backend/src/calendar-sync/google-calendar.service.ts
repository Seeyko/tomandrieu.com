import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarProvider } from '@prisma/client';
import { DateTime } from 'luxon';

export interface BusyTime {
  start: string;
  end: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  attendees?: { email: string; name?: string }[];
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async handleCallback(code: string): Promise<{ email: string }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Get user info to store email
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email!;

    // Store or update the connection
    await this.prisma.calendarConnection.upsert({
      where: {
        provider_email: {
          provider: CalendarProvider.GOOGLE,
          email,
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
        isActive: true,
      },
      create: {
        provider: CalendarProvider.GOOGLE,
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
        calendarId: 'primary',
        isActive: true,
      },
    });

    this.logger.log(`Connected Google Calendar for ${email}`);
    return { email };
  }

  private async getAuthenticatedClient(
    connectionId: string,
  ): Promise<OAuth2Client | null> {
    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || !connection.accessToken) {
      return null;
    }

    const client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    client.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken,
      expiry_date: connection.tokenExpiry?.getTime(),
    });

    // Check if token needs refresh
    if (
      connection.tokenExpiry &&
      connection.tokenExpiry.getTime() < Date.now()
    ) {
      try {
        const { credentials } = await client.refreshAccessToken();
        await this.prisma.calendarConnection.update({
          where: { id: connectionId },
          data: {
            accessToken: credentials.access_token,
            tokenExpiry: credentials.expiry_date
              ? new Date(credentials.expiry_date)
              : undefined,
          },
        });
        client.setCredentials(credentials);
      } catch (error) {
        this.logger.error('Failed to refresh Google token', error);
        return null;
      }
    }

    return client;
  }

  async getBusyTimes(
    connectionId: string,
    startDate: string,
    endDate: string,
  ): Promise<BusyTime[]> {
    const client = await this.getAuthenticatedClient(connectionId);
    if (!client) {
      return [];
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: DateTime.fromISO(startDate).toISO()!,
          timeMax: DateTime.fromISO(endDate).toISO()!,
          items: [{ id: connection?.calendarId || 'primary' }],
        },
      });

      const busyTimes =
        response.data.calendars?.[connection?.calendarId || 'primary']?.busy ||
        [];

      return busyTimes.map((busy) => ({
        start: busy.start!,
        end: busy.end!,
      }));
    } catch (error) {
      this.logger.error('Failed to get busy times from Google Calendar', error);
      return [];
    }
  }

  async createEvent(
    connectionId: string,
    event: CalendarEvent,
  ): Promise<string | null> {
    const client = await this.getAuthenticatedClient(connectionId);
    if (!client) {
      return null;
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const response = await calendar.events.insert({
        calendarId: connection?.calendarId || 'primary',
        requestBody: {
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.start,
            timeZone:
              this.configService.get<string>('DEFAULT_TIMEZONE') ||
              'Europe/Paris',
          },
          end: {
            dateTime: event.end,
            timeZone:
              this.configService.get<string>('DEFAULT_TIMEZONE') ||
              'Europe/Paris',
          },
          attendees: event.attendees?.map((a) => ({
            email: a.email,
            displayName: a.name,
          })),
        },
      });

      await this.prisma.calendarConnection.update({
        where: { id: connectionId },
        data: { lastSyncAt: new Date() },
      });

      return response.data.id || null;
    } catch (error) {
      this.logger.error('Failed to create Google Calendar event', error);
      return null;
    }
  }

  async deleteEvent(connectionId: string, eventId: string): Promise<boolean> {
    const client = await this.getAuthenticatedClient(connectionId);
    if (!client) {
      return false;
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      await calendar.events.delete({
        calendarId: connection?.calendarId || 'primary',
        eventId,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete Google Calendar event', error);
      return false;
    }
  }
}
