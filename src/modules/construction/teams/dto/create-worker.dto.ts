import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ example: 'John Worker' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'worker@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
