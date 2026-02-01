import { ApiProperty } from '@nestjs/swagger';
import {
  ReportTypeEnum,
  type ReportType,
} from '../../../../shared/enums/prisma.enums';

export class ReportResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty({ enum: ReportTypeEnum })
  type!: ReportType;

  @ApiProperty()
  periodStart!: Date;

  @ApiProperty()
  periodEnd!: Date;

  @ApiProperty()
  data!: Record<string, any>;

  @ApiProperty()
  createdAt!: Date;
}
