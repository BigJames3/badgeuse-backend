import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';

@Module({
  imports: [PrismaModule],
  providers: [SitesService],
  controllers: [SitesController],
})
export class SitesModule {}
