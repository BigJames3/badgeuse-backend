import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';

@ApiTags('company-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: CurrentUserData) {
    return this.reportsService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(
    @Query() query: QueryReportDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.reportsService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.reportsService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.reportsService.remove(id, user);
  }
}
