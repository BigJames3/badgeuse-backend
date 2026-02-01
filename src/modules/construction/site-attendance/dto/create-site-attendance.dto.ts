import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateSiteAttendanceDto {
  @ApiProperty()
  @IsUUID()
  siteId!: string;

  @ApiProperty()
  @IsUUID()
  workerId!: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: '2026-01-31T08:00:00.000Z' })
  @IsDateString()
  checkInAt!: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
