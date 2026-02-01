import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePayrollDto {
  @ApiProperty()
  @IsUUID()
  attendanceSummaryId!: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  periodEnd!: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  grossPay!: number;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  @Min(0)
  netPay!: number;
}
