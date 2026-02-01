import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto, user: CurrentUserData) {
    this.assertWrite(user);
    await this.assertClass(dto.classId, user.companyId);
    return this.prisma.course.create({
      data: {
        companyId: user.companyId,
        classId: dto.classId,
        name: dto.name,
        code: dto.code,
      },
    });
  }

  async findAll(query: QueryCourseDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.CourseWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.classId) where.classId = query.classId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const item = await this.prisma.course.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Course not found');
    return item;
  }

  async update(id: string, dto: UpdateCourseDto, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.course.update({
      where: { id },
      data: { name: dto.name, code: dto.code },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.course.update({
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

  private async assertClass(classId: string, companyId: string) {
    const klass = await this.prisma.schoolClass.findFirst({
      where: { id: classId, companyId, deletedAt: null },
    });
    if (!klass) throw new NotFoundException('Class not found');
  }
}
