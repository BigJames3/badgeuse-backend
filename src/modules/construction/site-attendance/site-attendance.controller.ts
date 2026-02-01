import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/auth/guards/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import {
  CurrentUser,
  CurrentUserData,
} from '../../../shared/decorators/current-user.decorator';
import { SiteAttendanceService } from './site-attendance.service';
import { CreateSiteAttendanceDto } from './dto/create-site-attendance.dto';
import { UpdateSiteAttendanceDto } from './dto/update-site-attendance.dto';
import { QuerySiteAttendanceDto } from './dto/query-site-attendance.dto';

@ApiTags('construction-site-attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('construction/site-attendance')
export class SiteAttendanceController {
  constructor(private readonly siteAttendanceService: SiteAttendanceService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Post()
  create(
    @Body() dto: CreateSiteAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.siteAttendanceService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get()
  findAll(
    @Query() query: QuerySiteAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.siteAttendanceService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.siteAttendanceService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.siteAttendanceService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.siteAttendanceService.remove(id, user);
  }
}
