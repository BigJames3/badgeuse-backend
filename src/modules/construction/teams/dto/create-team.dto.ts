import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsUUID()
  siteId!: string;

  @ApiProperty({ example: 'Team A' })
  @IsString()
  name!: string;
}
