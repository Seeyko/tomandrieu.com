import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetSlotsDto {
  @IsDateString()
  date: string; // YYYY-MM-DD format

  @IsInt()
  @Min(15)
  @Transform(({ value }) => parseInt(value, 10))
  duration: number; // Duration in minutes (15, 30, 60)

  @IsOptional()
  @IsString()
  timezone?: string; // Visitor's timezone
}

export interface TimeSlot {
  start: string; // ISO datetime string
  end: string; // ISO datetime string
  available: boolean;
}
