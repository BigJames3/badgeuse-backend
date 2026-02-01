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
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';

@ApiTags('workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.RH)
  @Post()
  create(@Body() dto: CreateWorkerDto, @CurrentUser() user: CurrentUserData) {
    return this.workerService.create(dto, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.RH)
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.workerService.findAll(user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.RH)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.workerService.findById(id, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.workerService.remove(id, user);
  }
}
