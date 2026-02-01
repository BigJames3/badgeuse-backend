import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import {
  OvertimeStatusEnum,
  type OvertimeStatus,
} from '../../../../shared/enums/prisma.enums';

export class QueryOvertimeDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ enum: OvertimeStatusEnum })
  @IsOptional()
  @IsEnum(OvertimeStatusEnum)
  status?: OvertimeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;
}
