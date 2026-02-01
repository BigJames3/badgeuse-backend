import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  StudentAttendanceStatusEnum,
  type StudentAttendanceStatus,
} from '../../../../shared/enums/prisma.enums';

export class CreateStudentAttendanceDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: StudentAttendanceStatusEnum })
  @IsEnum(StudentAttendanceStatusEnum)
  status!: StudentAttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
