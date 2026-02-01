import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  classId!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email?: string | null;

  @ApiProperty()
  createdAt!: Date;
}
