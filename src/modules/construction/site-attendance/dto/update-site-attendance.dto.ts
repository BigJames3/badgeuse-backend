import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateSiteAttendanceDto {
  @ApiPropertyOptional({ example: '2026-01-31T17:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  checkOutAt?: string;
}
