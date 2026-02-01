import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClassDto {
  @ApiPropertyOptional({ example: 'Class B' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'B1' })
  @IsOptional()
  @IsString()
  code?: string;
}
