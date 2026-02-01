import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import type { Prisma } from '../../../../prisma/generated/prisma';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto, user: CurrentUserData) {
    this.assertWrite(user);
    return this.prisma.schedule.create({
      data: {
        companyId: user.companyId,
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        daysOfWeek: dto.daysOfWeek,
      },
    });
  }

  async findAll(query: QueryScheduleDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ScheduleWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.schedule.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.schedule.update({
      where: { id },
      data: {
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
        daysOfWeek: dto.daysOfWeek,
      },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.schedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private assertRead(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }

  private assertWrite(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.RH];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }
}
