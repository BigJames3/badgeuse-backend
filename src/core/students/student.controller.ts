import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../../shared/enums/role.enum';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../shared/decorators/current-user.decorator';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Post()
  create(@Body() dto: CreateStudentDto, @CurrentUser() user: CurrentUserData) {
    return this.studentService.create(dto, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.studentService.findAll(user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.studentService.findById(id, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.studentService.remove(id, user);
  }
}
