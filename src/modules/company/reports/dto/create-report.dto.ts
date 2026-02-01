import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum } from 'class-validator';
import {
  ReportTypeEnum,
  type ReportType,
} from '../../../../shared/enums/prisma.enums';

export class CreateReportDto {
  @ApiProperty({ enum: ReportTypeEnum })
  @IsEnum(ReportTypeEnum)
  type!: ReportType;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  periodEnd!: string;
}
