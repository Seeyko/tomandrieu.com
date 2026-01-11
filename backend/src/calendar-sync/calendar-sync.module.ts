import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { CalDAVService } from './caldav.service';
import { CalendarSyncController } from './calendar-sync.controller';
import { CalendarSyncService } from './calendar-sync.service';

@Module({
  controllers: [CalendarSyncController],
  providers: [CalendarSyncService, GoogleCalendarService, CalDAVService],
  exports: [CalendarSyncService, GoogleCalendarService, CalDAVService],
})
export class CalendarSyncModule {}
