import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CalendarSyncService } from './calendar-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('calendar')
export class CalendarSyncController {
  constructor(
    private calendarSyncService: CalendarSyncService,
    private configService: ConfigService,
  ) {}

  // List all connected calendars
  @UseGuards(JwtAuthGuard)
  @Get('connections')
  async getConnections() {
    return this.calendarSyncService.getActiveConnections();
  }

  // Disconnect a calendar
  @UseGuards(JwtAuthGuard)
  @Delete('connections/:id')
  async disconnectCalendar(@Param('id') id: string) {
    await this.calendarSyncService.disconnectCalendar(id);
    return { success: true };
  }

  // Google Calendar OAuth flow
  @UseGuards(JwtAuthGuard)
  @Get('google/connect')
  async connectGoogle(@Res() res: Response) {
    const authUrl = this.calendarSyncService.getGoogleAuthUrl();
    res.redirect(authUrl);
  }

  // Google Calendar OAuth callback
  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      await this.calendarSyncService.handleGoogleCallback(code);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      res.redirect(`${frontendUrl}/admin?calendar=connected`);
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      res.redirect(`${frontendUrl}/admin?calendar=error`);
    }
  }

  // Apple Calendar connection (CalDAV)
  @UseGuards(JwtAuthGuard)
  @Post('apple/connect')
  async connectApple(
    @Body('email') email: string,
    @Body('appSpecificPassword') appSpecificPassword: string,
  ) {
    return this.calendarSyncService.connectAppleCalendar(
      email,
      appSpecificPassword,
    );
  }
}
