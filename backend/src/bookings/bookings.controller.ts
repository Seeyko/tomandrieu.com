import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // Public endpoint - create a new booking
  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(dto);
  }

  // Public endpoint - get booking by ID (for confirmation page)
  @Get(':id')
  async getBooking(@Param('id') id: string) {
    const booking = await this.bookingsService.getBookingById(id);
    // Return limited info for public access
    return {
      id: booking.id,
      visitorName: booking.visitorName,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      duration: booking.duration,
      status: booking.status,
      meetingUrl: booking.meetingUrl,
    };
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllBookings(
    @Query('status') status?: BookingStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bookingsService.getAllBookings(status, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/upcoming')
  async getUpcomingBookings() {
    return this.bookingsService.getUpcomingBookings();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getStats() {
    return this.bookingsService.getBookingStats();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateBooking(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.updateBooking(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  async confirmBooking(
    @Param('id') id: string,
    @Body('meetingUrl') meetingUrl?: string,
  ) {
    return this.bookingsService.confirmBooking(id, meetingUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelBooking(@Param('id') id: string) {
    return this.bookingsService.cancelBooking(id);
  }
}
