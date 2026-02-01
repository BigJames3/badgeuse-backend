import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Class A' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'A1' })
  @IsString()
  code!: string;
}
