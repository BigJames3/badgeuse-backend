import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { ReportType, ReportTypeEnum } from '../../../shared/enums/prisma.enums';
import type { Prisma } from '../../../../prisma/generated/prisma';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto, user: CurrentUserData) {
    this.assertRead(user);
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const data = await this.buildReport(
      dto.type,
      user.companyId,
      periodStart,
      periodEnd,
    );
    return this.prisma.report.create({
      data: {
        companyId: user.companyId,
        type: dto.type,
        periodStart,
        periodEnd,
        data,
      },
    });
  }

  async findAll(query: QueryReportDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ReportWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.type) where.type = query.type;
    if (query.fromDate || query.toDate) {
      const periodFilter: Prisma.DateTimeFilter = {};
      if (query.fromDate) periodFilter.gte = new Date(query.fromDate);
      if (query.toDate) periodFilter.lte = new Date(query.toDate);
      where.periodStart = periodFilter;
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    return this.prisma.report.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertRead(user);
    return this.prisma.report.update({
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

  private async buildReport(
    type: ReportType,
    companyId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    if (type === ReportTypeEnum.ATTENDANCE) {
      const count = await this.prisma.attendance.count({
        where: {
          companyId,
          deletedAt: null,
          checkInAt: { gte: periodStart, lte: periodEnd },
        },
      });
      return { totalAttendance: count };
    }
    if (type === ReportTypeEnum.OVERTIME) {
      const total = await this.prisma.overtime.aggregate({
        where: {
          companyId,
          deletedAt: null,
          date: { gte: periodStart, lte: periodEnd },
          status: 'APPROVED',
        },
        _sum: { hours: true },
      });
      return { totalOvertimeHours: total._sum.hours ?? 0 };
    }
    const payrollSum = await this.prisma.payroll.aggregate({
      where: {
        companyId,
        deletedAt: null,
        periodStart: { gte: periodStart, lte: periodEnd },
      },
      _sum: { grossPay: true, netPay: true },
      _count: { _all: true },
    });
    return {
      payrollCount: payrollSum._count._all,
      totalGrossPay: payrollSum._sum.grossPay ?? 0,
      totalNetPay: payrollSum._sum.netPay ?? 0,
    };
  }
}
