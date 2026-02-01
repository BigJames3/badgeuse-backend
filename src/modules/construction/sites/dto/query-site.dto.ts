import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class QuerySiteDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Site' })
  @IsOptional()
  @IsString()
  search?: string;
}
