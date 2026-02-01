import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import {
  StudentAttendanceStatusEnum,
  type StudentAttendanceStatus,
} from '../../../../shared/enums/prisma.enums';

export class QueryStudentAttendanceDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ enum: StudentAttendanceStatusEnum })
  @IsOptional()
  @IsEnum(StudentAttendanceStatusEnum)
  status?: StudentAttendanceStatus;
}
