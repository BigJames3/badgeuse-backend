import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import {
  ReportTypeEnum,
  type ReportType,
} from '../../../../shared/enums/prisma.enums';

export class QueryReportDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReportTypeEnum })
  @IsOptional()
  @IsEnum(ReportTypeEnum)
  type?: ReportType;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
