import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { CurrentUserData } from '../../../shared/decorators/current-user.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { CreatePayrollExportDto } from './dto/create-payroll-export.dto';
import { QueryPayrollExportDto } from './dto/query-payroll-export.dto';
import { ExportFormatEnum } from '../../../shared/enums/prisma.enums';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { Payroll, Prisma } from '../../../../prisma/generated/prisma';

@Injectable()
export class PayrollExportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePayrollExportDto, user: CurrentUserData) {
    this.assertWrite(user);
    const payroll = await this.prisma.payroll.findFirst({
      where: { id: dto.payrollId, companyId: user.companyId, deletedAt: null },
    });
    if (!payroll) throw new NotFoundException('Payroll not found');

    const dir = path.join(process.cwd(), 'exports');
    await fs.mkdir(dir, { recursive: true });
    const filename = `payroll-${payroll.id}.${dto.format.toLowerCase()}`;
    const filePath = path.join(dir, filename);

    if (dto.format === ExportFormatEnum.CSV) {
      const csv = [
        'payrollId,periodStart,periodEnd,grossPay,netPay,status',
        `${payroll.id},${payroll.periodStart.toISOString()},${payroll.periodEnd.toISOString()},${payroll.grossPay},${payroll.netPay},${payroll.status}`,
      ].join('\n');
      await fs.writeFile(filePath, csv, 'utf8');
    } else {
      await this.generatePdf(filePath, payroll);
    }

    return this.prisma.payrollExport.create({
      data: {
        companyId: user.companyId,
        payrollId: payroll.id,
        format: dto.format,
        path: filePath,
      },
    });
  }

  async findAll(query: QueryPayrollExportDto, user: CurrentUserData) {
    this.assertRead(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.PayrollExportWhereInput = {
      companyId: user.companyId,
      deletedAt: null,
    };
    if (query.format) where.format = query.format;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.payrollExport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payrollExport.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async findOne(id: string, user: CurrentUserData) {
    this.assertRead(user);
    const item = await this.prisma.payrollExport.findFirst({
      where: { id, companyId: user.companyId, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Payroll export not found');
    return item;
  }

  async remove(id: string, user: CurrentUserData) {
    this.assertWrite(user);
    const item = await this.findOne(id, user);
    return this.prisma.payrollExport.update({
      where: { id: item.id },
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

  private async generatePdf(filePath: string, payroll: Payroll) {
    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = doc.pipe(createWriteStream(filePath));
      doc.fontSize(18).text('Payroll Export', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Payroll ID: ${payroll.id}`);
      doc.text(
        `Period: ${payroll.periodStart.toISOString()} - ${payroll.periodEnd.toISOString()}`,
      );
      doc.text(`Gross Pay: ${payroll.grossPay}`);
      doc.text(`Net Pay: ${payroll.netPay}`);
      doc.text(`Status: ${payroll.status}`);
      doc.end();
      stream.on('finish', () => resolve());
      stream.on('error', (err: Error) => reject(err));
    });
  }
}
