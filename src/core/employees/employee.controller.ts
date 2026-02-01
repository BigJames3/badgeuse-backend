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
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Post()
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: CurrentUserData) {
    return this.employeeService.create(dto, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.employeeService.findAll(user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.employeeService.findById(id, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.employeeService.remove(id, user);
  }
}
