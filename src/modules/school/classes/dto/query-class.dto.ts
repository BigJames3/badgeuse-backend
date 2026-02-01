import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class QueryClassDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Class' })
  @IsOptional()
  @IsString()
  search?: string;
}
