import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({ example: 'Evening Shift' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime?: string;

  @ApiPropertyOptional({ example: ['MON', 'TUE'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daysOfWeek?: string[];
}
