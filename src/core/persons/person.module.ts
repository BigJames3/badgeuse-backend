import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';

@Module({
  imports: [PrismaModule],
  providers: [PersonService],
  controllers: [PersonController],
  exports: [PersonService],
})
export class PersonModule {}
