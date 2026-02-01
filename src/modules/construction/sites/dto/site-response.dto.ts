import { ApiProperty } from '@nestjs/swagger';

export class SiteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  location?: string | null;

  @ApiProperty()
  latitude?: number | null;

  @ApiProperty()
  longitude?: number | null;
}
