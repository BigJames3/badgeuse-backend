import { ApiProperty } from '@nestjs/swagger';
import {
  OvertimeStatusEnum,
  type OvertimeStatus,
} from '../../../../shared/enums/prisma.enums';

export class OvertimeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty()
  hours!: number;

  @ApiProperty({ enum: OvertimeStatusEnum })
  status!: OvertimeStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
