import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOvertimeDto {
  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0.25)
  hours!: number;

  @ApiPropertyOptional({ example: 'End of month closing' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: 'user-id' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
