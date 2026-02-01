import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';

@Module({
  imports: [PrismaModule],
  providers: [OvertimeService],
  controllers: [OvertimeController],
})
export class OvertimeModule {}
