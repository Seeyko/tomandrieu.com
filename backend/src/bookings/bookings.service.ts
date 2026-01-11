import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { SlotsService } from '../slots/slots.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private slotsService: SlotsService,
    private configService: ConfigService,
  ) {}

  async createBooking(dto: CreateBookingDto) {
    const timezone =
      dto.timezone ||
      this.configService.get<string>('DEFAULT_TIMEZONE') ||
      'Europe/Paris';

    const startTime = DateTime.fromISO(dto.startTime, { zone: timezone });

    if (!startTime.isValid) {
      throw new BadRequestException('Invalid start time');
    }

    const endTime = startTime.plus({ minutes: dto.duration });

    // Verify the slot is still available
    const dateStr = startTime.toISODate()!;
    const availableSlots = await this.slotsService.getAvailableSlots(
      dateStr,
      dto.duration,
      timezone,
    );

    const isSlotAvailable = availableSlots.some((slot) => {
      const slotStart = DateTime.fromISO(slot.start);
      return slotStart.equals(startTime);
    });

    if (!isSlotAvailable) {
      throw new ConflictException(
        'This time slot is no longer available. Please select a different time.',
      );
    }

    // Create the booking
    const booking = await this.prisma.booking.create({
      data: {
        visitorName: dto.visitorName,
        visitorEmail: dto.visitorEmail,
        startTime: startTime.toJSDate(),
        endTime: endTime.toJSDate(),
        duration: dto.duration,
        timezone,
        notes: dto.notes,
        status: BookingStatus.PENDING,
      },
    });

    // TODO: Send confirmation email
    // TODO: Create calendar event via calendar-sync module

    return {
      id: booking.id,
      visitorName: booking.visitorName,
      visitorEmail: booking.visitorEmail,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      duration: booking.duration,
      timezone: booking.timezone,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    };
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getAllBookings(
    status?: BookingStatus,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  async getUpcomingBookings() {
    return this.prisma.booking.findMany({
      where: {
        startTime: { gte: new Date() },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async updateBooking(id: string, dto: UpdateBookingDto) {
    const booking = await this.getBookingById(id);

    const updateData: any = {};

    if (dto.status) {
      updateData.status = dto.status as BookingStatus;
    }

    if (dto.meetingUrl !== undefined) {
      updateData.meetingUrl = dto.meetingUrl;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // TODO: Send notification email if status changed
    // TODO: Update calendar event if applicable

    return updatedBooking;
  }

  async confirmBooking(id: string, meetingUrl?: string) {
    return this.updateBooking(id, {
      status: 'CONFIRMED',
      meetingUrl,
    });
  }

  async cancelBooking(id: string) {
    const booking = await this.getBookingById(id);

    // Can't cancel already completed bookings
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    return this.updateBooking(id, { status: 'CANCELLED' });
  }

  async getBookingsForDate(dateStr: string) {
    const date = DateTime.fromISO(dateStr);
    const startOfDay = date.startOf('day').toJSDate();
    const endOfDay = date.endOf('day').toJSDate();

    return this.prisma.booking.findMany({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getBookingStats() {
    const now = new Date();
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate();

    const [total, pending, confirmed, cancelled, recentBookings] =
      await Promise.all([
        this.prisma.booking.count(),
        this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
        this.prisma.booking.count({
          where: { status: BookingStatus.CONFIRMED },
        }),
        this.prisma.booking.count({
          where: { status: BookingStatus.CANCELLED },
        }),
        this.prisma.booking.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    return {
      total,
      pending,
      confirmed,
      cancelled,
      recentBookings,
    };
  }
}
