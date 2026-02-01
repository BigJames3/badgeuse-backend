import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { QuerySiteDto } from './dto/query-site.dto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSiteDto, user: CurrentUserData) {
    this.assertWrite(user);
    return this.prisma.constructionSite.create({
      data: {
        companyId: user.companyId,
        name: dto.name,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async findAll(query: QuerySiteDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ConstructionSiteWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.constructionSite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.constructionSite.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const site = await this.prisma.constructionSite.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async update(id: string, dto: UpdateSiteDto, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.constructionSite.update({
      where: { id },
      data: {
        name: dto.name,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    await this.findOne(id, user);
    return this.prisma.constructionSite.update({
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
}
