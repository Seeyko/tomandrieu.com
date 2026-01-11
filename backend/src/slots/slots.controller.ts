import { Controller, Get, Query } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { GetSlotsDto } from './dto/get-slots.dto';

@Controller('slots')
export class SlotsController {
  constructor(private slotsService: SlotsService) {}

  @Get()
  async getAvailableSlots(@Query() query: GetSlotsDto) {
    return this.slotsService.getAvailableSlots(
      query.date,
      query.duration,
      query.timezone,
    );
  }

  @Get('settings')
  async getSettings() {
    return this.slotsService.getSettings_Public();
  }

  @Get('dates')
  async getAvailableDates(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('duration') duration: string,
  ) {
    return this.slotsService.getAvailableDates(start, end, parseInt(duration, 10));
  }
}
