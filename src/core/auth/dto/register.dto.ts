import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'Super Admin' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'b3f8e9b6-0d7b-4f5f-8b0f-9c1d3e55b01e' })
  @IsUUID()
  companyId!: string;
}
