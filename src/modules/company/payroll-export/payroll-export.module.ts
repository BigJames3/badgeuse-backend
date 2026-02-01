import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { PayrollExportService } from './payroll-export.service';
import { PayrollExportController } from './payroll-export.controller';

@Module({
  imports: [PrismaModule],
  providers: [PayrollExportService],
  controllers: [PayrollExportController],
})
export class PayrollExportModule {}
