import { Module } from '@nestjs/common';
import { ConstructionService } from './construction.service';
import { ConstructionController } from './construction.controller';
import { SitesModule } from './sites/sites.module';
import { TeamsModule } from './teams/teams.module';
import { SiteAttendanceModule } from './site-attendance/site-attendance.module';

@Module({
  imports: [SitesModule, TeamsModule, SiteAttendanceModule],
  providers: [ConstructionService],
  controllers: [ConstructionController],
})
export class ConstructionModule {}
