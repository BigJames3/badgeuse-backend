export class DeviceEntity {
  id!: string;
  name!: string;
  ipAddress?: string | null;
  userId?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
