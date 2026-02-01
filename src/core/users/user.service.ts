import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RoleEnum } from '../../shared/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Prisma } from '../../../prisma/generated/prisma';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: { roles: RoleEnum[]; companyId: string }) {
    if (this.isSuperAdmin(currentUser.roles)) {
      return this.prisma.user.findMany({
        where: { deletedAt: null },
        select: this.userSelect,
      });
    }
    return this.prisma.user.findMany({
      where: { companyId: currentUser.companyId, deletedAt: null },
      select: this.userSelect,
    });
  }

  async findById(
    id: string,
    currentUser: { roles: RoleEnum[]; companyId: string },
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: this.userSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    if (!this.canAccessUser(currentUser, user.companyId)) {
      throw new ForbiddenException('Access denied');
    }
    return user;
  }

  async create(
    data: CreateUserDto,
    currentUser: { roles: RoleEnum[]; companyId: string },
  ) {
    if (
      !this.isSuperAdmin(currentUser.roles) &&
      data.companyId !== currentUser.companyId
    ) {
      throw new ForbiddenException('Access denied');
    }

    const roles =
      data.roles && data.roles.length > 0 ? data.roles : [RoleEnum.EMPLOYEE];
    if (
      !this.isSuperAdmin(currentUser.roles) &&
      roles.includes(RoleEnum.SUPER_ADMIN)
    ) {
      throw new ForbiddenException('Access denied');
    }
    const passwordHash = this.hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        companyId: data.companyId,
        roles,
      },
      select: this.userSelect,
    });
  }

  async update(
    id: string,
    data: UpdateUserDto,
    currentUser: { roles: RoleEnum[]; companyId: string },
  ) {
    const existing = await this.findById(id, currentUser);
    const updateData: Prisma.UserUpdateInput = {
      email: data.email,
      name: data.name,
      roles: data.roles,
    };
    if (
      data.roles &&
      data.roles.includes(RoleEnum.SUPER_ADMIN) &&
      !this.isSuperAdmin(currentUser.roles)
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (data.password) {
      updateData.passwordHash = this.hashPassword(data.password);
    }
    return this.prisma.user.update({
      where: { id: existing.id },
      data: updateData,
      select: this.userSelect,
    });
  }

  async remove(
    id: string,
    currentUser: { roles: RoleEnum[]; companyId: string },
  ) {
    const existing = await this.findById(id, currentUser);
    return this.prisma.user.update({
      where: { id: existing.id },
      data: { deletedAt: new Date(), isActive: false },
      select: this.userSelect,
    });
  }

  private isSuperAdmin(roles: RoleEnum[]) {
    return roles.includes(RoleEnum.SUPER_ADMIN);
  }

  private canAccessUser(
    currentUser: { roles: RoleEnum[]; companyId: string },
    targetCompanyId: string,
  ) {
    return (
      this.isSuperAdmin(currentUser.roles) ||
      currentUser.companyId === targetCompanyId
    );
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private userSelect = {
    id: true,
    email: true,
    name: true,
    roles: true,
    companyId: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  };
}
