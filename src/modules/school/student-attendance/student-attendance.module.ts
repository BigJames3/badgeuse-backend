import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { StudentAttendanceService } from './student-attendance.service';
import { StudentAttendanceController } from './student-attendance.controller';

@Module({
  imports: [PrismaModule],
  providers: [StudentAttendanceService],
  controllers: [StudentAttendanceController],
})
export class StudentAttendanceModule {}
