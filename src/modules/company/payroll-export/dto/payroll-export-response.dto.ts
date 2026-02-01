import { ApiProperty } from '@nestjs/swagger';
import {
  ExportFormatEnum,
  type ExportFormat,
} from '../../../../shared/enums/prisma.enums';

export class PayrollExportResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  payrollId!: string;

  @ApiProperty({ enum: ExportFormatEnum })
  format!: ExportFormat;

  @ApiProperty()
  path!: string;

  @ApiProperty()
  createdAt!: Date;
}
