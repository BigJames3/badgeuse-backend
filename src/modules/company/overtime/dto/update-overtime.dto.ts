import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  OvertimeStatusEnum,
  type OvertimeStatus,
} from '../../../../shared/enums/prisma.enums';

export class UpdateOvertimeDto {
  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0.25)
  hours?: number;

  @ApiPropertyOptional({ example: 'Adjusted reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ enum: OvertimeStatusEnum })
  @IsOptional()
  @IsEnum(OvertimeStatusEnum)
  status?: OvertimeStatus;
}
