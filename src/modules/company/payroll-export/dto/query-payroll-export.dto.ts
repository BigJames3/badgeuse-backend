import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import {
  ExportFormatEnum,
  type ExportFormat,
} from '../../../../shared/enums/prisma.enums';

export class QueryPayrollExportDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ExportFormatEnum })
  @IsOptional()
  @IsEnum(ExportFormatEnum)
  format?: ExportFormat;
}
