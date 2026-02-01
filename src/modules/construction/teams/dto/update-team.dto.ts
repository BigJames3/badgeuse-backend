import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Team B' })
  @IsOptional()
  @IsString()
  name?: string;
}
