import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import {
  PayrollStatusEnum,
  type PayrollStatus,
} from '../../../../shared/enums/prisma.enums';

export class UpdatePayrollDto {
  @ApiPropertyOptional({ example: 1600 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grossPay?: number;

  @ApiPropertyOptional({ example: 1300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netPay?: number;

  @ApiPropertyOptional({ enum: PayrollStatusEnum })
  @IsOptional()
  @IsEnum(PayrollStatusEnum)
  status?: PayrollStatus;
}
