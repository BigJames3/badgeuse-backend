import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { QueryTeamDto } from './dto/query-team.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { QueryWorkerDto } from './dto/query-worker.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(dto: CreateTeamDto, user: CurrentUserData) {
    this.assertWrite(user);
    const site = await this.prisma.constructionSite.findFirst({
      where: { id: dto.siteId, companyId: user.companyId, deletedAt: null },
    });
    if (!site) throw new NotFoundException('Site not found');
    return this.prisma.constructionTeam.create({
      data: {
        companyId: user.companyId,
        siteId: dto.siteId,
        name: dto.name,
      },
    });
  }

  async findAllTeams(query: QueryTeamDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ConstructionTeamWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.siteId) where.siteId = query.siteId;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.constructionTeam.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.constructionTeam.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findTeam(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const team = await this.prisma.constructionTeam.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async updateTeam(id: string, dto: UpdateTeamDto, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findTeam(id, user);
    return this.prisma.constructionTeam.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async removeTeam(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findTeam(id, user);
    return this.prisma.constructionTeam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addWorker(teamId: string, dto: CreateWorkerDto, user: CurrentUserData) {
    this.assertWrite(user);
    const team = await this.prisma.constructionTeam.findFirst({
      where: { id: teamId, companyId: user.companyId, deletedAt: null },
    });
    if (!team) throw new NotFoundException('Team not found');
    return this.prisma.constructionWorker.create({
      data: {
        companyId: user.companyId,
        teamId,
        name: dto.name,
        email: dto.email,
      },
    });
  }

  async listWorkers(
    teamId: string,
    query: QueryWorkerDto,
    user: CurrentUserData,
  ) {
    this.assertRead(user);
    await this.findTeam(teamId, user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ConstructionWorkerWhereInput = {
      companyId: user.companyId,
      teamId,
      deletedAt: null,
    };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.constructionWorker.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.constructionWorker.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async updateWorker(
    workerId: string,
    dto: UpdateWorkerDto,
    user: CurrentUserData,
  ) {
    this.assertWrite(user);
    const worker = await this.prisma.constructionWorker.findFirst({
      where: { id: workerId, companyId: user.companyId, deletedAt: null },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.prisma.constructionWorker.update({
      where: { id: worker.id },
      data: { name: dto.name, email: dto.email },
    });
  }

  async removeWorker(workerId: string, user: CurrentUserData) {
    this.assertWrite(user);
    const worker = await this.prisma.constructionWorker.findFirst({
      where: { id: workerId, companyId: user.companyId, deletedAt: null },
    });
    if (!worker) throw new NotFoundException('Worker not found');
    return this.prisma.constructionWorker.update({
      where: { id: worker.id },
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
}
