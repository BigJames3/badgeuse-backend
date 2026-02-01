import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UpdateOvertimeDto } from './dto/update-overtime.dto';
import { QueryOvertimeDto } from './dto/query-overtime.dto';
import { OvertimeStatusEnum } from '../../../shared/enums/prisma.enums';
import type { Prisma } from '../../../../prisma/generated/prisma';

@Injectable()
export class OvertimeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOvertimeDto, user: CurrentUserData) {
    this.assertRead(user);
    const date = new Date(dto.date);
    await this.assertPeriodOpen(user.companyId, date, date);
    const targetUserId = dto.userId ?? user.id;
    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, companyId: user.companyId, deletedAt: null },
    });
    if (!target) throw new NotFoundException('User not found');
    return this.prisma.overtime.create({
      data: {
        companyId: user.companyId,
        userId: targetUserId,
        date,
        hours: dto.hours,
        reason: dto.reason,
      },
    });
  }

  async findAll(query: QueryOvertimeDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.OvertimeWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.fromDate || query.toDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.fromDate) dateFilter.gte = new Date(query.fromDate);
      if (query.toDate) dateFilter.lte = new Date(query.toDate);
      where.date = dateFilter;
    }
    if (query.status) where.status = query.status;
    if (query.userId) where.userId = query.userId;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.overtime.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.overtime.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const item = await this.prisma.overtime.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Overtime not found');
    return item;
  }

  async update(id: string, dto: UpdateOvertimeDto, user: CurrentUserData) {
    this.assertRead(user);
    const existing = await this.findOne(id, user);
    const date = dto.date ? new Date(dto.date) : existing.date;
    await this.assertPeriodOpen(user.companyId, date, date);

    if (dto.status && !this.canApprove(user)) {
      throw new ForbiddenException('Only RH or ADMIN can approve overtime');
    }

    if (existing.status !== OvertimeStatusEnum.PENDING && dto.status) {
      throw new ConflictException('Overtime already processed');
    }

    return this.prisma.overtime.update({
      where: { id: existing.id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        hours: dto.hours,
        reason: dto.reason,
        status: dto.status,
        approvedByUserId: dto.status ? user.id : undefined,
        approvedAt: dto.status ? new Date() : undefined,
      },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    if (!this.canApprove(user)) {
      throw new ForbiddenException('Only RH or ADMIN can delete overtime');
    }
    const existing = await this.findOne(id, user);
    await this.assertPeriodOpen(user.companyId, existing.date, existing.date);
    return this.prisma.overtime.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  private assertRead(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.RH, RoleEnum.MANAGER];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }

  private canApprove(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.RH];
    return user.roles.some((r) => allowed.includes(r));
  }

  private async assertPeriodOpen(companyId: string, start: Date, end: Date) {
    const closure = await this.prisma.periodClosure.findFirst({
      where: {
        companyId,
        periodStart: { lte: end },
        periodEnd: { gte: start },
      },
    });
    if (closure) {
      throw new ConflictException('Period is closed');
    }
  }
}
