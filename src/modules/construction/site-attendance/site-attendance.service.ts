import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateSiteAttendanceDto } from './dto/create-site-attendance.dto';
import { UpdateSiteAttendanceDto } from './dto/update-site-attendance.dto';
import { QuerySiteAttendanceDto } from './dto/query-site-attendance.dto';
import type { Prisma } from '../../../../prisma/generated/prisma';

@Injectable()
export class SiteAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSiteAttendanceDto, user: CurrentUserData) {
    this.assertWrite(user);
    const site = await this.prisma.constructionSite.findFirst({
      where: { id: dto.siteId, companyId: user.companyId, deletedAt: null },
    });
    if (!site) throw new NotFoundException('Site not found');

    const worker = await this.prisma.constructionWorker.findFirst({
      where: { id: dto.workerId, companyId: user.companyId, deletedAt: null },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const date = new Date(dto.date);
    const existing = await this.prisma.siteAttendance.findFirst({
      where: { workerId: dto.workerId, date, deletedAt: null },
    });
    if (existing)
      throw new ConflictException(
        'Attendance already recorded for this worker and day',
      );

    if (
      site.latitude != null &&
      site.longitude != null &&
      dto.latitude != null &&
      dto.longitude != null
    ) {
      const distance = this.getDistanceMeters(
        site.latitude,
        site.longitude,
        dto.latitude,
        dto.longitude,
      );
      if (distance > 500) {
        throw new ForbiddenException('Location out of site range');
      }
    }

    const record = await this.prisma.siteAttendance.create({
      data: {
        companyId: user.companyId,
        siteId: dto.siteId,
        workerId: dto.workerId,
        date,
        checkInAt: new Date(dto.checkInAt),
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId: user.companyId,
        action: 'SITE_ATTENDANCE_CREATE',
        entity: 'SiteAttendance',
        entityId: record.id,
        userId: user.id,
        data: {
          siteId: dto.siteId,
          workerId: dto.workerId,
        },
      },
    });

    return record;
  }

  async findAll(query: QuerySiteAttendanceDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.SiteAttendanceWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.siteId) where.siteId = query.siteId;
    if (query.workerId) where.workerId = query.workerId;
    if (query.fromDate || query.toDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.fromDate) dateFilter.gte = new Date(query.fromDate);
      if (query.toDate) dateFilter.lte = new Date(query.toDate);
      where.date = dateFilter;
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.siteAttendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.siteAttendance.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const item = await this.prisma.siteAttendance.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Attendance not found');
    return item;
  }

  async update(
    id: string,
    dto: UpdateSiteAttendanceDto,
    user: CurrentUserData,
  ) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.siteAttendance.update({
      where: { id },
      data: {
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : undefined,
      },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.siteAttendance.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private assertRead(user: CurrentUserData) {
    const allowed: RoleEnum[] = [
      RoleEnum.ADMIN,
      RoleEnum.SITE_MANAGER,
      RoleEnum.MANAGER,
    ];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }

  private assertWrite(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.SITE_MANAGER];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }

  private getDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
