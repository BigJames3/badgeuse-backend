import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  siteId!: string;

  @ApiProperty()
  name!: string;
}
