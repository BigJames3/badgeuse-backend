import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';

@Module({
  imports: [PrismaModule],
  providers: [PayrollService],
  controllers: [PayrollController],
})
export class PayrollModule {}
