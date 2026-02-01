import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'MATH-101' })
  @IsString()
  code!: string;
}
