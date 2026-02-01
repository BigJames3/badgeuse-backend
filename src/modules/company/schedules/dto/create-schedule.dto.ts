import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Matches } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 'Morning Shift' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;

  @ApiProperty({ example: ['MON', 'TUE', 'WED', 'THU', 'FRI'] })
  @IsArray()
  @IsString({ each: true })
  daysOfWeek!: string[];
}
