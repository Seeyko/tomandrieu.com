import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAvailabilityRuleDto,
  UpdateAvailabilityRuleDto,
} from './dto/create-availability.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // Availability Rules
  async getAllRules() {
    return this.prisma.availabilityRule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getActiveRules() {
    return this.prisma.availabilityRule.findMany({
      where: { isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getRulesByDay(dayOfWeek: number) {
    return this.prisma.availabilityRule.findMany({
      where: { dayOfWeek, isActive: true },
      orderBy: { startTime: 'asc' },
    });
  }

  async createRule(dto: CreateAvailabilityRuleDto) {
    return this.prisma.availabilityRule.create({
      data: {
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        timezone: dto.timezone || 'Europe/Paris',
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateRule(id: string, dto: UpdateAvailabilityRuleDto) {
    const rule = await this.prisma.availabilityRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('Availability rule not found');
    }

    return this.prisma.availabilityRule.update({
      where: { id },
      data: dto,
    });
  }

  async deleteRule(id: string) {
    const rule = await this.prisma.availabilityRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('Availability rule not found');
    }

    return this.prisma.availabilityRule.delete({
      where: { id },
    });
  }

  // Blocked Dates
  async getAllBlockedDates() {
    return this.prisma.blockedDate.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async getBlockedDatesInRange(startDate: Date, endDate: Date) {
    return this.prisma.blockedDate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async createBlockedDate(dto: CreateBlockedDateDto) {
    return this.prisma.blockedDate.create({
      data: {
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason,
      },
    });
  }

  async deleteBlockedDate(id: string) {
    const blockedDate = await this.prisma.blockedDate.findUnique({
      where: { id },
    });

    if (!blockedDate) {
      throw new NotFoundException('Blocked date not found');
    }

    return this.prisma.blockedDate.delete({
      where: { id },
    });
  }

  // Helper: Get formatted availability for public display
  async getPublicAvailability() {
    const rules = await this.getActiveRules();
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const grouped = rules.reduce(
      (acc, rule) => {
        const day = dayNames[rule.dayOfWeek];
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push({
          start: rule.startTime,
          end: rule.endTime,
        });
        return acc;
      },
      {} as Record<string, { start: string; end: string }[]>,
    );

    return {
      timezone: rules[0]?.timezone || 'Europe/Paris',
      schedule: grouped,
    };
  }
}
