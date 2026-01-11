import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import {
  CreateAvailabilityRuleDto,
  UpdateAvailabilityRuleDto,
} from './dto/create-availability.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('availability')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  // Public endpoint - get formatted availability for display
  @Get()
  async getPublicAvailability() {
    return this.availabilityService.getPublicAvailability();
  }

  // Admin endpoints - require authentication
  @UseGuards(JwtAuthGuard)
  @Get('rules')
  async getAllRules() {
    return this.availabilityService.getAllRules();
  }

  @UseGuards(JwtAuthGuard)
  @Post('rules')
  async createRule(@Body() dto: CreateAvailabilityRuleDto) {
    return this.availabilityService.createRule(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityRuleDto,
  ) {
    return this.availabilityService.updateRule(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.availabilityService.deleteRule(id);
  }

  // Blocked dates
  @UseGuards(JwtAuthGuard)
  @Get('blocked-dates')
  async getAllBlockedDates() {
    return this.availabilityService.getAllBlockedDates();
  }

  @UseGuards(JwtAuthGuard)
  @Post('blocked-dates')
  async createBlockedDate(@Body() dto: CreateBlockedDateDto) {
    return this.availabilityService.createBlockedDate(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blocked-dates/:id')
  async deleteBlockedDate(@Param('id') id: string) {
    return this.availabilityService.deleteBlockedDate(id);
  }
}
