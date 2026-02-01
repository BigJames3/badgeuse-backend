import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RoleEnum } from '../../shared/enums/role.enum';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { validateAttendanceTimes } from './attendance.rules';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: { roles: RoleEnum[]; companyId: string }) {
    if (currentUser.roles.includes(RoleEnum.SUPER_ADMIN)) {
      return this.prisma.attendance.findMany({
        where: { deletedAt: null },
        include: { user: true, company: true },
      });
    }
    return this.prisma.attendance.findMany({
      where: { companyId: currentUser.companyId, deletedAt: null },
      include: { user: true, company: true },
    });
  }

  async create(
    data: CreateAttendanceDto,
    currentUser: { roles: RoleEnum[]; companyId: string },
  ) {
    if (!currentUser.roles.includes(RoleEnum.SUPER_ADMIN)) {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { companyId: true },
      });
      if (!user || user.companyId !== currentUser.companyId) {
        throw new ForbiddenException('Access denied');
      }
    }

    const checkInAt = data.checkInAt ? new Date(data.checkInAt) : new Date();
    const checkOutAt = data.checkOutAt ? new Date(data.checkOutAt) : null;
    validateAttendanceTimes(checkInAt, checkOutAt);

    const user = await this.prisma.user.findFirst({
      where: { id: data.userId, deletedAt: null },
      select: { companyId: true },
    });
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return this.prisma.attendance.create({
      data: {
        userId: data.userId,
        companyId: user.companyId,
        checkInAt,
        checkOutAt,
      },
    });
  }
}
