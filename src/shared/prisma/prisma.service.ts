import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    const adapter = new PrismaPg({
      connectionString,
      ssl: false,
    });
    super({ adapter });
    this.registerAuditMiddleware();
  }

  private registerAuditMiddleware() {
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null;
    const getString = (value: unknown): string | undefined =>
      typeof value === 'string' ? value : undefined;
    const actionMap: Record<string, 'CREATE' | 'UPDATE' | 'DELETE'> = {
      create: 'CREATE',
      update: 'UPDATE',
      delete: 'DELETE',
    };
    const entityMap: Record<string, 'USER' | 'ATTENDANCE' | 'PAYROLL'> = {
      User: 'USER',
      Attendance: 'ATTENDANCE',
      Payroll: 'PAYROLL',
    };

    const auditClient = this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            const result = await query(args);
            const actionType = actionMap[operation];
            if (!actionType || !model || model === 'AuditLog') {
              return result;
            }

            const resultRecord = isRecord(result as unknown)
              ? (result as Record<string, unknown>)
              : undefined;
            const argsRecord = isRecord(args as unknown)
              ? (args as Record<string, unknown>)
              : undefined;
            const whereRecord = isRecord(argsRecord?.where)
              ? (argsRecord?.where as Record<string, unknown>)
              : undefined;
            const dataRecord = isRecord(argsRecord?.data)
              ? (argsRecord?.data as Record<string, unknown>)
              : undefined;

            const entityId = getString(resultRecord?.id) ?? getString(whereRecord?.id);
            const companyId =
              getString(resultRecord?.companyId) ?? getString(dataRecord?.companyId);

            if (!entityId || !companyId) {
              return result;
            }

            const userId =
              getString(resultRecord?.userId) ?? getString(dataRecord?.userId);

            await this.auditLog.create({
              data: {
                companyId,
                action: actionType,
                entity: model,
                entityId,
                userId,
                data: {
                  model,
                  action: operation,
                  entityType: entityMap[model],
                },
              },
            });

            return result;
          },
        },
      },
    });

    Object.assign(this, auditClient);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
