import {
  IsString,
  IsEmail,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  visitorName: string;

  @IsEmail()
  visitorEmail: string;

  @IsDateString()
  startTime: string; // ISO datetime string

  @IsInt()
  @Min(15)
  @Max(120)
  duration: number; // Duration in minutes

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
