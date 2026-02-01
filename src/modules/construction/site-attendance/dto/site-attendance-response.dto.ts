import { ApiProperty } from '@nestjs/swagger';

export class SiteAttendanceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  siteId!: string;

  @ApiProperty()
  workerId!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty()
  checkInAt!: Date;

  @ApiProperty()
  checkOutAt?: Date | null;
}
