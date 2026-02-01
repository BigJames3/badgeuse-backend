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
import { CreateWorkerDto } from './dto/create-worker.dto';

@Injectable()
export class WorkerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkerDto, user: CurrentUserData) {
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, deletedAt: null },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    this.assertCompanyAccess(user, person.companyId);

    const existing = await this.prisma.worker.findFirst({
      where: { personId: person.id, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Worker already exists for this person');
    }

    return this.prisma.worker.create({
      data: {
        company: { connect: { id: person.companyId } },
        person: { connect: { id: person.id } },
      },
      select: this.workerSelect,
    });
  }

  async findAll(user: CurrentUserData) {
    const where: Prisma.WorkerWhereInput = { deletedAt: null };
    if (!this.isSuperAdmin(user.roles)) {
      where.companyId = user.companyId;
    }
    return this.prisma.worker.findMany({
      where,
      select: this.workerSelect,
    });
  }

  async findById(id: string, user: CurrentUserData) {
    const worker = await this.prisma.worker.findFirst({
      where: { id, deletedAt: null },
      select: this.workerSelect,
    });
    if (!worker) {
      throw new NotFoundException('Worker not found');
    }
    this.assertCompanyAccess(user, worker.companyId);
    return worker;
  }

  async remove(id: string, user: CurrentUserData) {
    const existing = await this.findById(id, user);
    return this.prisma.worker.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
      select: this.workerSelect,
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

  private workerSelect = {
    id: true,
    companyId: true,
    personId: true,
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
