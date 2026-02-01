import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({ example: 'a0b2e3c4-5d6f-4a2b-8c9d-0e1f2a3b4c5d' })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({ example: '2026-01-31T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  checkInAt?: string;

  @ApiPropertyOptional({ example: '2026-01-31T17:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  checkOutAt?: string;
}
