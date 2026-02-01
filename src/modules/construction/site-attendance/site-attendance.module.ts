import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { SiteAttendanceService } from './site-attendance.service';
import { SiteAttendanceController } from './site-attendance.controller';

@Module({
  imports: [PrismaModule],
  providers: [SiteAttendanceService],
  controllers: [SiteAttendanceController],
})
export class SiteAttendanceModule {}
