import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime, Interval } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { TimeSlot } from './dto/get-slots.dto';

@Injectable()
export class SlotsService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
    private configService: ConfigService,
  ) {}

  async getAvailableSlots(
    dateStr: string,
    duration: number,
    visitorTimezone?: string,
  ): Promise<TimeSlot[]> {
    const ownerTimezone =
      this.configService.get<string>('DEFAULT_TIMEZONE') || 'Europe/Paris';
    const timezone = visitorTimezone || ownerTimezone;

    // Parse the date in the owner's timezone
    const date = DateTime.fromISO(dateStr, { zone: ownerTimezone });

    if (!date.isValid) {
      return [];
    }

    // Get day of week (Luxon uses 1-7 for Mon-Sun, we need 0-6 for Sun-Sat)
    const dayOfWeek = date.weekday === 7 ? 0 : date.weekday;

    // Get availability rules for this day
    const rules = await this.availabilityService.getRulesByDay(dayOfWeek);

    if (rules.length === 0) {
      return [];
    }

    // Get settings for buffer time and min notice
    const settings = await this.getSettings();

    // Generate all possible slots based on availability rules
    const allSlots: TimeSlot[] = [];

    for (const rule of rules) {
      const [startHour, startMin] = rule.startTime.split(':').map(Number);
      const [endHour, endMin] = rule.endTime.split(':').map(Number);

      let slotStart = date.set({
        hour: startHour,
        minute: startMin,
        second: 0,
        millisecond: 0,
      });

      const ruleEnd = date.set({
        hour: endHour,
        minute: endMin,
        second: 0,
        millisecond: 0,
      });

      // Generate slots every {duration} minutes
      while (slotStart.plus({ minutes: duration }) <= ruleEnd) {
        const slotEnd = slotStart.plus({ minutes: duration });

        allSlots.push({
          start: slotStart.toISO()!,
          end: slotEnd.toISO()!,
          available: true,
        });

        // Move to next slot (with buffer)
        slotStart = slotEnd.plus({ minutes: settings.bufferMinutes });
      }
    }

    // Filter out unavailable slots
    const availableSlots = await this.filterAvailableSlots(
      allSlots,
      date,
      settings,
    );

    // Convert to visitor's timezone if different
    if (timezone !== ownerTimezone) {
      return availableSlots.map((slot) => ({
        ...slot,
        start: DateTime.fromISO(slot.start).setZone(timezone).toISO()!,
        end: DateTime.fromISO(slot.end).setZone(timezone).toISO()!,
      }));
    }

    return availableSlots;
  }

  private async filterAvailableSlots(
    slots: TimeSlot[],
    date: DateTime,
    settings: {
      minNoticeHours: number;
      bufferMinutes: number;
    },
  ): Promise<TimeSlot[]> {
    const now = DateTime.now();
    const minNoticeTime = now.plus({ hours: settings.minNoticeHours });

    // Get existing bookings for this date
    const startOfDay = date.startOf('day').toJSDate();
    const endOfDay = date.endOf('day').toJSDate();

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    // Get blocked dates/times for this date
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Filter slots
    return slots.filter((slot) => {
      const slotStart = DateTime.fromISO(slot.start);
      const slotEnd = DateTime.fromISO(slot.end);

      // Check minimum notice time
      if (slotStart < minNoticeTime) {
        return false;
      }

      // Check against existing bookings (with buffer)
      for (const booking of existingBookings) {
        const bookingStart = DateTime.fromJSDate(booking.startTime).minus({
          minutes: settings.bufferMinutes,
        });
        const bookingEnd = DateTime.fromJSDate(booking.endTime).plus({
          minutes: settings.bufferMinutes,
        });

        const slotInterval = Interval.fromDateTimes(slotStart, slotEnd);
        const bookingInterval = Interval.fromDateTimes(bookingStart, bookingEnd);

        if (slotInterval.overlaps(bookingInterval)) {
          return false;
        }
      }

      // Check against blocked dates
      for (const blocked of blockedDates) {
        // If no specific time range, the whole day is blocked
        if (!blocked.startTime || !blocked.endTime) {
          return false;
        }

        // Check specific time range
        const [blockedStartHour, blockedStartMin] = blocked.startTime
          .split(':')
          .map(Number);
        const [blockedEndHour, blockedEndMin] = blocked.endTime
          .split(':')
          .map(Number);

        const blockedStart = slotStart.set({
          hour: blockedStartHour,
          minute: blockedStartMin,
        });
        const blockedEnd = slotStart.set({
          hour: blockedEndHour,
          minute: blockedEndMin,
        });

        const slotInterval = Interval.fromDateTimes(slotStart, slotEnd);
        const blockedInterval = Interval.fromDateTimes(blockedStart, blockedEnd);

        if (slotInterval.overlaps(blockedInterval)) {
          return false;
        }
      }

      return true;
    });
  }

  private async getSettings() {
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'default' },
    });

    return {
      minNoticeHours: settings?.minNoticeHours ?? 24,
      bufferMinutes: settings?.bufferMinutes ?? 15,
      maxAdvanceDays: settings?.maxAdvanceDays ?? 60,
      allowedDurations: settings?.allowedDurations ?? [15, 30, 60],
    };
  }

  async getSettings_Public() {
    const settings = await this.getSettings();
    return {
      allowedDurations: settings.allowedDurations,
      maxAdvanceDays: settings.maxAdvanceDays,
      timezone:
        this.configService.get<string>('DEFAULT_TIMEZONE') || 'Europe/Paris',
    };
  }

  async getAvailableDates(
    startDate: string,
    endDate: string,
    duration: number,
  ): Promise<string[]> {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    const availableDates: string[] = [];

    let current = start;
    while (current <= end) {
      const dateStr = current.toISODate()!;
      const slots = await this.getAvailableSlots(dateStr, duration);

      if (slots.length > 0) {
        availableDates.push(dateStr);
      }

      current = current.plus({ days: 1 });
    }

    return availableDates;
  }
}
