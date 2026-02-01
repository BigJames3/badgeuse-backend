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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';

@ApiTags('school-classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('school/classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Post()
  create(@Body() dto: CreateClassDto, @CurrentUser() user: CurrentUserData) {
    return this.classesService.createClass(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get()
  findAll(@Query() query: QueryClassDto, @CurrentUser() user: CurrentUserData) {
    return this.classesService.findAllClasses(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.classesService.findClass(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.classesService.updateClass(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.classesService.removeClass(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Post(':id/students')
  addStudent(
    @Param('id') classId: string,
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.classesService.addStudent(classId, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get(':id/students')
  listStudents(
    @Param('id') classId: string,
    @Query() query: QueryStudentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.classesService.listStudents(classId, query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Patch('students/:studentId')
  updateStudent(
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.classesService.updateStudent(studentId, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Delete('students/:studentId')
  removeStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.classesService.removeStudent(studentId, user);
  }
}
