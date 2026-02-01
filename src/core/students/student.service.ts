import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RoleEnum } from '../../shared/enums/role.enum';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto, user: CurrentUserData) {
    const person = await this.prisma.person.findFirst({
      where: { id: dto.personId, deletedAt: null },
    });
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    this.assertCompanyAccess(user, person.companyId);

    const schoolClass = await this.prisma.schoolClass.findFirst({
      where: { id: dto.classId, deletedAt: null },
    });
    if (!schoolClass) {
      throw new NotFoundException('Class not found');
    }
    if (schoolClass.companyId !== person.companyId) {
      throw new BadRequestException('Class and person must belong to same company');
    }

    const existing = await this.prisma.student.findFirst({
      where: { personId: person.id, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Student already exists for this person');
    }

    return this.prisma.student.create({
      data: {
        company: { connect: { id: person.companyId } },
        class: { connect: { id: schoolClass.id } },
        firstName: person.firstName,
        lastName: person.lastName,
        email: dto.email,
        person: { connect: { id: person.id } },
      },
      select: this.studentSelect,
    });
  }

  async findAll(user: CurrentUserData) {
    const where: Prisma.StudentWhereInput = { deletedAt: null };
    if (!this.isSuperAdmin(user.roles)) {
      where.companyId = user.companyId;
    }
    return this.prisma.student.findMany({
      where,
      select: this.studentSelect,
    });
  }

  async findById(id: string, user: CurrentUserData) {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: this.studentSelect,
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    this.assertCompanyAccess(user, student.companyId);
    return student;
  }

  async remove(id: string, user: CurrentUserData) {
    const existing = await this.findById(id, user);
    return this.prisma.student.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
      select: this.studentSelect,
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

  private studentSelect = {
    id: true,
    companyId: true,
    classId: true,
    personId: true,
    firstName: true,
    lastName: true,
    email: true,
    createdAt: true,
    updatedAt: true,
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
