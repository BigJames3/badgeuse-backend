import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async createClass(dto: CreateClassDto, user: CurrentUserData) {
    this.assertWrite(user);
    return this.prisma.schoolClass.create({
      data: {
        companyId: user.companyId,
        name: dto.name,
        code: dto.code,
      },
    });
  }

  async findAllClasses(query: QueryClassDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.SchoolClassWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.schoolClass.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.schoolClass.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findClass(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const item = await this.prisma.schoolClass.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Class not found');
    return item;
  }

  async updateClass(id: string, dto: UpdateClassDto, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findClass(id, user);
    return this.prisma.schoolClass.update({
      where: { id },
      data: { name: dto.name, code: dto.code },
    });
  }

  async removeClass(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findClass(id, user);
    return this.prisma.schoolClass.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addStudent(
    classId: string,
    dto: CreateStudentDto,
    user: CurrentUserData,
  ) {
    this.assertWrite(user);
    await this.findClass(classId, user);
    return this.prisma.student.create({
      data: {
        companyId: user.companyId,
        classId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
      },
    });
  }

  async listStudents(
    classId: string,
    query: QueryStudentDto,
    user: CurrentUserData,
  ) {
    this.assertRead(user);
    await this.findClass(classId, user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.StudentWhereInput = {
      classId,
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async updateStudent(
    id: string,
    dto: UpdateStudentDto,
    user: CurrentUserData,
  ) {
    this.assertWrite(user);
    const student = await this.prisma.student.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.student.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
      },
    });
  }

  async removeStudent(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    const student = await this.prisma.student.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!student) throw new NotFoundException('Student not found');
    return this.prisma.student.update({
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
