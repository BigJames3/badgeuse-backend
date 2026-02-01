import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  StudentAttendanceStatusEnum,
  type StudentAttendanceStatus,
} from '../../../../shared/enums/prisma.enums';

export class UpdateStudentAttendanceDto {
  @ApiPropertyOptional({ enum: StudentAttendanceStatusEnum })
  @IsOptional()
  @IsEnum(StudentAttendanceStatusEnum)
  status?: StudentAttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
