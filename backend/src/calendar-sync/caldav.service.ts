import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDAVClient, DAVCalendar } from 'tsdav';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarProvider } from '@prisma/client';
import { DateTime } from 'luxon';
import { BusyTime, CalendarEvent } from './google-calendar.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CalDAVService {
  private readonly logger = new Logger(CalDAVService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async connectAppleCalendar(
    email: string,
    appSpecificPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Test connection
      const client = await createDAVClient({
        serverUrl: 'https://caldav.icloud.com',
        credentials: {
          username: email,
          password: appSpecificPassword,
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
      });

      // Get calendars to verify connection works
      const calendars = await client.fetchCalendars();

      if (!calendars || calendars.length === 0) {
        return { success: false, error: 'No calendars found' };
      }

      // Find the primary calendar (usually the first one)
      const primaryCalendar = calendars[0];

      // Store the connection
      await this.prisma.calendarConnection.upsert({
        where: {
          provider_email: {
            provider: CalendarProvider.APPLE,
            email,
          },
        },
        update: {
          serverUrl: 'https://caldav.icloud.com',
          username: email,
          password: appSpecificPassword, // TODO: Encrypt this
          calendarId: primaryCalendar.url,
          isActive: true,
        },
        create: {
          provider: CalendarProvider.APPLE,
          email,
          serverUrl: 'https://caldav.icloud.com',
          username: email,
          password: appSpecificPassword, // TODO: Encrypt this
          calendarId: primaryCalendar.url,
          isActive: true,
        },
      });

      this.logger.log(`Connected Apple Calendar for ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to connect Apple Calendar', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to connect calendar',
      };
    }
  }

  private async getClient(connectionId: string): Promise<any | null> {
    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (
      !connection ||
      !connection.serverUrl ||
      !connection.username ||
      !connection.password
    ) {
      return null;
    }

    try {
      const client = await createDAVClient({
        serverUrl: connection.serverUrl,
        credentials: {
          username: connection.username,
          password: connection.password,
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
      });
      return client;
    } catch (error) {
      this.logger.error('Failed to create CalDAV client', error);
      return null;
    }
  }

  async getBusyTimes(
    connectionId: string,
    startDate: string,
    endDate: string,
  ): Promise<BusyTime[]> {
    const client = await this.getClient(connectionId);
    if (!client) {
      return [];
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection?.calendarId) {
      return [];
    }

    try {
      const start = DateTime.fromISO(startDate);
      const end = DateTime.fromISO(endDate);

      const events = await client.fetchCalendarObjects({
        calendar: { url: connection.calendarId } as DAVCalendar,
        timeRange: {
          start: start.toISO()!,
          end: end.toISO()!,
        },
      });

      const busyTimes: BusyTime[] = [];

      for (const event of events) {
        if (!event.data) continue;

        // Parse iCalendar data to extract DTSTART and DTEND
        const dtStartMatch = event.data.match(/DTSTART[^:]*:(\d{8}T\d{6}Z?)/);
        const dtEndMatch = event.data.match(/DTEND[^:]*:(\d{8}T\d{6}Z?)/);

        if (dtStartMatch && dtEndMatch) {
          const eventStart = this.parseICalDateTime(dtStartMatch[1]);
          const eventEnd = this.parseICalDateTime(dtEndMatch[1]);

          if (eventStart && eventEnd) {
            busyTimes.push({
              start: eventStart,
              end: eventEnd,
            });
          }
        }
      }

      return busyTimes;
    } catch (error) {
      this.logger.error('Failed to get busy times from CalDAV', error);
      return [];
    }
  }

  private parseICalDateTime(icalDate: string): string | null {
    try {
      // Handle format: 20260115T090000Z or 20260115T090000
      const year = icalDate.substring(0, 4);
      const month = icalDate.substring(4, 6);
      const day = icalDate.substring(6, 8);
      const hour = icalDate.substring(9, 11);
      const minute = icalDate.substring(11, 13);
      const second = icalDate.substring(13, 15);

      const isUTC = icalDate.endsWith('Z');
      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${isUTC ? 'Z' : ''}`;

      return DateTime.fromISO(isoString).toISO();
    } catch {
      return null;
    }
  }

  async createEvent(
    connectionId: string,
    event: CalendarEvent,
  ): Promise<string | null> {
    const client = await this.getClient(connectionId);
    if (!client) {
      return null;
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection?.calendarId) {
      return null;
    }

    try {
      const uid = uuidv4();
      const start = DateTime.fromISO(event.start);
      const end = DateTime.fromISO(event.end);

      const icalEvent = this.createICalEvent(uid, event, start, end);

      await client.createCalendarObject({
        calendar: { url: connection.calendarId } as DAVCalendar,
        filename: `${uid}.ics`,
        iCalString: icalEvent,
      });

      await this.prisma.calendarConnection.update({
        where: { id: connectionId },
        data: { lastSyncAt: new Date() },
      });

      return uid;
    } catch (error) {
      this.logger.error('Failed to create CalDAV event', error);
      return null;
    }
  }

  private createICalEvent(
    uid: string,
    event: CalendarEvent,
    start: DateTime,
    end: DateTime,
  ): string {
    const now = DateTime.now().toFormat("yyyyMMdd'T'HHmmss'Z'");
    const dtStart = start.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
    const dtEnd = end.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");

    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Booking System//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${this.escapeICalText(event.summary)}`;

    if (event.description) {
      ical += `
DESCRIPTION:${this.escapeICalText(event.description)}`;
    }

    if (event.attendees) {
      for (const attendee of event.attendees) {
        ical += `
ATTENDEE;CN=${attendee.name || attendee.email}:mailto:${attendee.email}`;
      }
    }

    ical += `
END:VEVENT
END:VCALENDAR`;

    return ical;
  }

  private escapeICalText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  async deleteEvent(connectionId: string, eventId: string): Promise<boolean> {
    const client = await this.getClient(connectionId);
    if (!client) {
      return false;
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection?.calendarId) {
      return false;
    }

    try {
      await client.deleteCalendarObject({
        calendarObject: {
          url: `${connection.calendarId}${eventId}.ics`,
        },
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete CalDAV event', error);
      return false;
    }
  }
}
