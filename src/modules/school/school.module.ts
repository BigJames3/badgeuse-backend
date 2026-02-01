import { Module } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { ClassesModule } from './classes/classes.module';
import { CoursesModule } from './courses/courses.module';
import { StudentAttendanceModule } from './student-attendance/student-attendance.module';

@Module({
  imports: [ClassesModule, CoursesModule, StudentAttendanceModule],
  providers: [SchoolService],
  controllers: [SchoolController],
})
export class SchoolModule {}
