import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class QueryStudentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  search?: string;
}
