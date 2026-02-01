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
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { QueryOvertimeDto } from './dto/query-overtime.dto';
import { OvertimeService } from './overtime.service';

@ApiTags('company-overtime')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company/overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Post()
  create(@Body() dto: CreateOvertimeDto, @CurrentUser() user: CurrentUserData) {
    return this.overtimeService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(
    @Query() query: QueryOvertimeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.overtimeService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.overtimeService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOvertimeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.overtimeService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.overtimeService.remove(id, user);
  }
}
