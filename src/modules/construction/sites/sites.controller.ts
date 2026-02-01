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
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { QuerySiteDto } from './dto/query-site.dto';

@ApiTags('construction-sites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('construction/sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Post()
  create(@Body() dto: CreateSiteDto, @CurrentUser() user: CurrentUserData) {
    return this.sitesService.create(dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get()
  findAll(@Query() query: QuerySiteDto, @CurrentUser() user: CurrentUserData) {
    return this.sitesService.findAll(query, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER, RoleEnum.MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.sitesService.findOne(id, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.sitesService.update(id, dto, user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.SITE_MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.sitesService.remove(id, user);
  }
}
