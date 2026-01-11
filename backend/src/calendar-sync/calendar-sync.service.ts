import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleCalendarService, BusyTime, CalendarEvent } from './google-calendar.service';
import { CalDAVService } from './caldav.service';
import { CalendarProvider } from '@prisma/client';

@Injectable()
export class CalendarSyncService {
  private readonly logger = new Logger(CalendarSyncService.name);

  constructor(
    private prisma: PrismaService,
    private googleCalendar: GoogleCalendarService,
    private caldavService: CalDAVService,
  ) {}

  async getActiveConnections() {
    return this.prisma.calendarConnection.findMany({
      where: { isActive: true },
      select: {
        id: true,
        provider: true,
        email: true,
        lastSyncAt: true,
        createdAt: true,
      },
    });
  }

  async disconnectCalendar(connectionId: string) {
    return this.prisma.calendarConnection.delete({
      where: { id: connectionId },
    });
  }

  async getAllBusyTimes(startDate: string, endDate: string): Promise<BusyTime[]> {
    const connections = await this.getActiveConnections();
    const allBusyTimes: BusyTime[] = [];

    for (const connection of connections) {
      try {
        let busyTimes: BusyTime[] = [];

        if (connection.provider === CalendarProvider.GOOGLE) {
          busyTimes = await this.googleCalendar.getBusyTimes(
            connection.id,
            startDate,
            endDate,
          );
        } else if (connection.provider === CalendarProvider.APPLE) {
          busyTimes = await this.caldavService.getBusyTimes(
            connection.id,
            startDate,
            endDate,
          );
        }

        allBusyTimes.push(...busyTimes);
      } catch (error) {
        this.logger.error(
          `Failed to get busy times from ${connection.provider} (${connection.email})`,
          error,
        );
      }
    }

    return allBusyTimes;
  }

  async createEventInAllCalendars(event: CalendarEvent): Promise<string[]> {
    const connections = await this.getActiveConnections();
    const eventIds: string[] = [];

    for (const connection of connections) {
      try {
        let eventId: string | null = null;

        if (connection.provider === CalendarProvider.GOOGLE) {
          eventId = await this.googleCalendar.createEvent(connection.id, event);
        } else if (connection.provider === CalendarProvider.APPLE) {
          eventId = await this.caldavService.createEvent(connection.id, event);
        }

        if (eventId) {
          eventIds.push(`${connection.provider}:${eventId}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to create event in ${connection.provider} (${connection.email})`,
          error,
        );
      }
    }

    return eventIds;
  }

  // Google Calendar specific methods
  getGoogleAuthUrl(): string {
    return this.googleCalendar.getAuthUrl();
  }

  async handleGoogleCallback(code: string) {
    return this.googleCalendar.handleCallback(code);
  }

  // Apple Calendar specific methods
  async connectAppleCalendar(email: string, appSpecificPassword: string) {
    return this.caldavService.connectAppleCalendar(email, appSpecificPassword);
  }
}
