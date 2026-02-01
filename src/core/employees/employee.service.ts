import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RoleEnum } from '../../shared/enums/role.enum';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto, user: CurrentUserData) {
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, deletedAt: null },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    this.assertCompanyAccess(user, person.companyId);

    const existing = await this.prisma.employee.findFirst({
      where: { personId: person.id, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Employee already exists for this person');
    }

    if (dto.userId) {
      const linkedUser = await this.prisma.user.findFirst({
        where: { id: dto.userId, deletedAt: null },
      });
      if (!linkedUser) {
        throw new NotFoundException('User not found');
      }
      this.assertCompanyAccess(user, linkedUser.companyId);
    }

    if (dto.scheduleId) {
      const schedule = await this.prisma.schedule.findFirst({
        where: { id: dto.scheduleId, deletedAt: null },
      });
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }
      this.assertCompanyAccess(user, schedule.companyId);
    }

    return this.prisma.employee.create({
      data: {
        company: { connect: { id: person.companyId } },
        person: { connect: { id: person.id } },
        user: dto.userId ? { connect: { id: dto.userId } } : undefined,
        schedule: dto.scheduleId
          ? { connect: { id: dto.scheduleId } }
          : undefined,
        matricule: dto.matricule,
      },
      select: this.employeeSelect,
    });
  }

  async findAll(user: CurrentUserData) {
    const where: Prisma.EmployeeWhereInput = { deletedAt: null };
    if (!this.isSuperAdmin(user.roles)) {
      where.companyId = user.companyId;
    }
    return this.prisma.employee.findMany({
      where,
      select: this.employeeSelect,
    });
  }

  async findById(id: string, user: CurrentUserData) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: this.employeeSelect,
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    this.assertCompanyAccess(user, employee.companyId);
    return employee;
  }

  async remove(id: string, user: CurrentUserData) {
    const existing = await this.findById(id, user);
    return this.prisma.employee.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
      select: this.employeeSelect,
    });
  }

  private assertCompanyAccess(user: CurrentUserData, companyId: string) {
    if (!this.isSuperAdmin(user.roles) && user.companyId !== companyId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private isSuperAdmin(roles: RoleEnum[]) {
    return roles.includes(RoleEnum.SUPER_ADMIN);
  }

  private employeeSelect = {
    id: true,
    companyId: true,
    personId: true,
    userId: true,
    scheduleId: true,
    matricule: true,
    createdAt: true,
    person: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    },
  };
}
