import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: '9f1f5a3d-7f76-4c2f-9d5c-3f2a3b2c1f0d' })
  @IsUUID()
  personId!: string;

  @ApiPropertyOptional({ example: 'b0e7c4ab-9938-4f44-9dcb-1b5c1a2f1c2d' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: '3b7b2c21-4b88-4d9e-b1ce-5a8d2d4a4f0a' })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @ApiPropertyOptional({ example: 'EMP-2026-001' })
  @IsOptional()
  @IsString()
  matricule?: string;
}
