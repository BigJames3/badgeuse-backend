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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';

@ApiTags('school-courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('school/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Post()
  create(@Body() dto: CreateCourseDto, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get()
  findAll(
    @Query() query: QueryCourseDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.coursesService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.coursesService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.TEACHER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.coursesService.remove(id, user);
  }
}
