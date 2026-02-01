import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ example: '9f1f5a3d-7f76-4c2f-9d5c-3f2a3b2c1f0d' })
  @IsUUID()
  personId!: string;
}
