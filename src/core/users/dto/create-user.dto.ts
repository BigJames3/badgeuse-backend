import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { RoleEnum } from '../../../shared/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'employee@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'b3f8e9b6-0d7b-4f5f-8b0f-9c1d3e55b01e' })
  @IsUUID()
  companyId!: string;

  @ApiPropertyOptional({ enum: RoleEnum, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RoleEnum, { each: true })
  roles?: RoleEnum[];
}
