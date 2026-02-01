import { ApiProperty } from '@nestjs/swagger';

export class WorkerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  teamId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email?: string | null;
}
