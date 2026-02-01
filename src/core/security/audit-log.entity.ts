export class AuditLogEntity {
  id!: string;
  action!: string;
  userId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt!: Date;
}
