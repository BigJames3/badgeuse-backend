import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Advanced Math' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'MATH-201' })
  @IsOptional()
  @IsString()
  code?: string;
}
