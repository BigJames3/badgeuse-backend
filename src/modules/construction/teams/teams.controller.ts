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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { QueryWorkerDto } from './dto/query-worker.dto';

@ApiTags('construction-teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('construction/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Post()
  create(@Body() dto: CreateTeamDto, @CurrentUser() user: CurrentUserData) {
    return this.teamsService.createTeam(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get()
  findAll(@Query() query: QueryTeamDto, @CurrentUser() user: CurrentUserData) {
    return this.teamsService.findAllTeams(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.teamsService.findTeam(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.teamsService.updateTeam(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.teamsService.removeTeam(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Post(':id/workers')
  addWorker(
    @Param('id') teamId: string,
    @Body() dto: CreateWorkerDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.teamsService.addWorker(teamId, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get(':id/workers')
  listWorkers(
    @Param('id') teamId: string,
    @Query() query: QueryWorkerDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.teamsService.listWorkers(teamId, query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Patch('workers/:workerId')
  updateWorker(
    @Param('workerId') workerId: string,
    @Body() dto: UpdateWorkerDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.teamsService.updateWorker(workerId, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Delete('workers/:workerId')
  removeWorker(
    @Param('workerId') workerId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.teamsService.removeWorker(workerId, user);
  }
}
