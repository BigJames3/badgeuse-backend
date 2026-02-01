import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

@Module({
  imports: [PrismaModule],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
