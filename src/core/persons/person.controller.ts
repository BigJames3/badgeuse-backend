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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../../shared/enums/role.enum';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../shared/decorators/current-user.decorator';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@ApiTags('persons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Post()
  create(@Body() dto: CreatePersonDto, @CurrentUser() user: CurrentUserData) {
    return this.personService.create(dto, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.personService.findAll(user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.personService.findById(id, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.personService.update(id, dto, user);
  }

  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.RH)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.personService.remove(id, user);
  }
}
