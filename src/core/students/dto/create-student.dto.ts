import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: '9f1f5a3d-7f76-4c2f-9d5c-3f2a3b2c1f0d' })
  @IsUUID()
  personId!: string;

  @ApiProperty({ example: '6c7f5c53-3f64-4f58-9f44-10bd43874244' })
  @IsUUID()
  classId!: string;

  @ApiPropertyOptional({ example: 'student@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
