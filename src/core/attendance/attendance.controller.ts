import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../../shared/enums/role.enum';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../shared/decorators/current-user.decorator';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.attendanceService.findAll(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Post()
  create(
    @Body() data: CreateAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.attendanceService.create(data, user);
  }
}
