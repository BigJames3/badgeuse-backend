import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateStudentAttendanceDto } from './dto/create-student-attendance.dto';
import { UpdateStudentAttendanceDto } from './dto/update-student-attendance.dto';
import { QueryStudentAttendanceDto } from './dto/query-student-attendance.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class StudentAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentAttendanceDto, user: CurrentUserData) {
    this.assertWrite(user);
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, companyId: user.companyId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    const date = new Date(dto.date);
    const existing = await this.prisma.studentAttendance.findFirst({
      where: { studentId: dto.studentId, date },
    });
    if (existing)
      throw new ConflictException('Attendance already recorded for this day');
    return this.prisma.studentAttendance.create({
      data: {
        companyId: user.companyId,
        studentId: dto.studentId,
        date,
        status: dto.status,
        note: dto.note,
        recordedByUserId: user.id,
      },
    });
  }

  async findAll(query: QueryStudentAttendanceDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.StudentAttendanceWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.studentId) where.studentId = query.studentId;
    if (query.classId) {
      where.student = { is: { classId: query.classId } };
    }
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (query.fromDate) dateFilter.gte = new Date(query.fromDate);
      if (query.toDate) dateFilter.lte = new Date(query.toDate);
      where.date = dateFilter;
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.studentAttendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.studentAttendance.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const item = await this.prisma.studentAttendance.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Attendance not found');
    return item;
  }

  async update(
    id: string,
    dto: UpdateStudentAttendanceDto,
    user: CurrentUserData,
  ) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.studentAttendance.update({
      where: { id },
      data: { status: dto.status, note: dto.note },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.studentAttendance.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private assertRead(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.RH];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }

  private assertWrite(user: CurrentUserData) {
    const allowed: RoleEnum[] = [RoleEnum.ADMIN, RoleEnum.TEACHER];
    if (!user.roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Access denied');
    }
  }
}
