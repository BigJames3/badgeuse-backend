import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../../shared/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../shared/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.usersService.findAll(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.usersService.findById(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH)
  @Post()
  create(@Body() data: CreateUserDto, @CurrentUser() user: CurrentUserData) {
    return this.usersService.create(data, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.usersService.update(id, data, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.usersService.remove(id, user);
  }
}
