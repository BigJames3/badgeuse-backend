import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { SchedulesModule } from './schedules/schedules.module';
import { OvertimeModule } from './overtime/overtime.module';
import { PayrollModule } from './payroll/payroll.module';
import { PayrollExportModule } from './payroll-export/payroll-export.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    SchedulesModule,
    OvertimeModule,
    PayrollModule,
    PayrollExportModule,
    ReportsModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
})
export class CompanyModule {}
