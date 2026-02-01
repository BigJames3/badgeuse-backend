import { ApiProperty } from '@nestjs/swagger';
import {
  StudentAttendanceStatusEnum,
  type StudentAttendanceStatus,
} from '../../../../shared/enums/prisma.enums';

export class StudentAttendanceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty({ enum: StudentAttendanceStatusEnum })
  status!: StudentAttendanceStatus;

  @ApiProperty()
  createdAt!: Date;
}
