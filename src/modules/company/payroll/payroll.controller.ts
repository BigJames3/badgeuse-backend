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
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';

@ApiTags('company-payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Post()
  create(@Body() dto: CreatePayrollDto, @CurrentUser() user: CurrentUserData) {
    return this.payrollService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(
    @Query() query: QueryPayrollDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.payrollService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.payrollService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePayrollDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.payrollService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.payrollService.remove(id, user);
  }
}
