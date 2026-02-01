import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [PrismaModule],
  providers: [ClassesService],
  controllers: [ClassesController],
})
export class ClassesModule {}
