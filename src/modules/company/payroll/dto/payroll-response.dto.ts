import { ApiProperty } from '@nestjs/swagger';
import {
  PayrollStatusEnum,
  type PayrollStatus,
} from '../../../../shared/enums/prisma.enums';

export class PayrollResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  attendanceSummaryId!: string;

  @ApiProperty()
  periodStart!: Date;

  @ApiProperty()
  periodEnd!: Date;

  @ApiProperty()
  grossPay!: number;

  @ApiProperty()
  netPay!: number;

  @ApiProperty({ enum: PayrollStatusEnum })
  status!: PayrollStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
