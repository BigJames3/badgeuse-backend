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
import { StudentAttendanceService } from './student-attendance.service';
import { CreateStudentAttendanceDto } from './dto/create-student-attendance.dto';
import { UpdateStudentAttendanceDto } from './dto/update-student-attendance.dto';
import { QueryStudentAttendanceDto } from './dto/query-student-attendance.dto';

@ApiTags('school-student-attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('school/student-attendance')
export class StudentAttendanceController {
  constructor(
    private readonly studentAttendanceService: StudentAttendanceService,
  ) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Post()
  create(
    @Body() dto: CreateStudentAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.studentAttendanceService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get()
  findAll(
    @Query() query: QueryStudentAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.studentAttendanceService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.studentAttendanceService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStudentAttendanceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.studentAttendanceService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.studentAttendanceService.remove(id, user);
  }
}
