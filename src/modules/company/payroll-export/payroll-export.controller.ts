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
import { PayrollExportService } from './payroll-export.service';
import { CreatePayrollExportDto } from './dto/create-payroll-export.dto';
import { QueryPayrollExportDto } from './dto/query-payroll-export.dto';

@ApiTags('company-payroll-exports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company/payroll-exports')
export class PayrollExportController {
  constructor(private readonly payrollExportService: PayrollExportService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Post()
  create(
    @Body() dto: CreatePayrollExportDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.payrollExportService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(
    @Query() query: QueryPayrollExportDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.payrollExportService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.payrollExportService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.payrollExportService.remove(id, user);
  }
}
