import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import {
  PayrollStatusEnum,
  type PayrollStatus,
} from '../../../../shared/enums/prisma.enums';

export class QueryPayrollDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ enum: PayrollStatusEnum })
  @IsOptional()
  @IsEnum(PayrollStatusEnum)
  status?: PayrollStatus;
}
