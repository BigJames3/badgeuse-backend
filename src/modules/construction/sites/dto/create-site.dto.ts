import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Site A' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Downtown' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
