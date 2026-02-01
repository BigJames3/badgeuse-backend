export class AttendanceEntity {
  id!: string;
  userId!: string;
  companyId!: string;
  checkInAt!: Date;
  checkOutAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
