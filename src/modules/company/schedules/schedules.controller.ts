import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Body,
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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { SchedulesService } from './schedules.service';

@ApiTags('company-schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Post()
  create(@Body() dto: CreateScheduleDto, @CurrentUser() user: CurrentUserData) {
    return this.schedulesService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(
    @Query() query: QueryScheduleDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.schedulesService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.schedulesService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.schedulesService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.schedulesService.remove(id, user);
  }
}
