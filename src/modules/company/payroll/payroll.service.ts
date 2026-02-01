import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';
import type { Prisma } from '../../../../prisma/generated/prisma';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePayrollDto, user: CurrentUserData) {
    this.assertWrite(user);
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    await this.assertPeriodOpen(user.companyId, periodStart, periodEnd);

    const summary = await this.prisma.attendanceSummary.findFirst({
      where: {
        id: dto.attendanceSummaryId,
        companyId: user.companyId,
        deletedAt: null,
      },
    });
    if (!summary) throw new NotFoundException('Attendance summary not found');

    const existing = await this.prisma.payroll.findFirst({
      where: { attendanceSummaryId: dto.attendanceSummaryId, deletedAt: null },
    });
    if (existing)
      throw new ConflictException('Payroll already exists for summary');

    return this.prisma.$transaction(async (tx) => {
      return tx.payroll.create({
        data: {
          companyId: user.companyId,
          attendanceSummaryId: dto.attendanceSummaryId,
          periodStart,
          periodEnd,
          grossPay: dto.grossPay,
          netPay: dto.netPay,
        },
      });
    });
  }

  async findAll(query: QueryPayrollDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.PayrollWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.fromDate || query.toDate) {
      const periodFilter: Prisma.DateTimeFilter = {};
      if (query.fromDate) periodFilter.gte = new Date(query.fromDate);
      if (query.toDate) periodFilter.lte = new Date(query.toDate);
      where.periodStart = periodFilter;
    }
    if (query.status) where.status = query.status;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
      }),
      this.prisma.payroll.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!payroll) throw new NotFoundException('Payroll not found');
    return payroll;
  }

  async update(id: string, dto: UpdatePayrollDto, user: CurrentUserData) {
    this.assertWrite(user);
    const existing = await this.findOne(id, user);
    await this.assertPeriodOpen(
      user.companyId,
      existing.periodStart,
      existing.periodEnd,
    );
    return this.prisma.payroll.update({
      where: { id: existing.id },
      data: {
        grossPay: dto.grossPay,
        netPay: dto.netPay,
        status: dto.status,
      },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    const existing = await this.findOne(id, user);
    await this.assertPeriodOpen(
      user.companyId,
      existing.periodStart,
      existing.periodEnd,
    );
    return this.prisma.payroll.update({
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

  private assertWrite(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.RH];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
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
