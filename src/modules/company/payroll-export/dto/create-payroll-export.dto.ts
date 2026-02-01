import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import {
  ExportFormatEnum,
  type ExportFormat,
} from '../../../../shared/enums/prisma.enums';

export class CreatePayrollExportDto {
  @ApiProperty()
  @IsUUID()
  payrollId!: string;

  @ApiProperty({ enum: ExportFormatEnum })
  @IsEnum(ExportFormatEnum)
  format!: ExportFormat;
}
