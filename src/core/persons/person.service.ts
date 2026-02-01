import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RoleEnum } from '../../shared/enums/role.enum';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePersonDto, user: CurrentUserData) {
    const companyId = this.resolveCompanyId(dto.companyId, user);
    if (!companyId) {
      throw new BadRequestException('Company is required');
    }
    return this.prisma.person.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        companyId,
      },
      select: this.personSelect,
    });
  }

  async findAll(user: CurrentUserData) {
    const where: Prisma.PersonWhereInput = { deletedAt: null };
    if (!this.isSuperAdmin(user.roles)) {
      where.companyId = user.companyId;
    }
    return this.prisma.person.findMany({
      where,
      select: this.personSelect,
    });
  }

  async findById(id: string, user: CurrentUserData) {
    const person = await this.prisma.person.findFirst({
      where: { id, deletedAt: null },
      select: this.personSelect,
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    this.assertCompanyAccess(user, person.companyId);
    return person;
  }

  async update(id: string, dto: UpdatePersonDto, user: CurrentUserData) {
    const existing = await this.findById(id, user);
    const data: Prisma.PersonUpdateInput = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    };
    return this.prisma.person.update({
      where: { id: existing.id },
      data,
      select: this.personSelect,
    });
  }

  async remove(id: string, user: CurrentUserData) {
    const existing = await this.findById(id, user);
    return this.prisma.person.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
      select: this.personSelect,
    });
  }

  private resolveCompanyId(companyId: string | undefined, user: CurrentUserData) {
    if (this.isSuperAdmin(user.roles)) {
      return companyId ?? user.companyId;
    }
    if (companyId && companyId !== user.companyId) {
      throw new ForbiddenException('Access denied');
    }
    return user.companyId;
  }

  private assertCompanyAccess(user: CurrentUserData, companyId: string) {
    if (!this.isSuperAdmin(user.roles) && user.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private isSuperAdmin(roles: RoleEnum[]) {
    return roles.includes(RoleEnum.SUPER_ADMIN);
  }

  private personSelect = {
    id: true,
    firstName: true,
    lastName: true,
    phone: true,
    companyId: true,
    createdAt: true,
    updatedAt: true,
  };
}
