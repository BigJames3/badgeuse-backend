import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleEnum } from '../../../shared/enums/role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'employee@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: RoleEnum, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RoleEnum, { each: true })
  roles?: RoleEnum[];

  @ApiPropertyOptional({ example: 'ChangeMe123!' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
