import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class QueryScheduleDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Morning' })
  @IsOptional()
  @IsString()
  search?: string;
}
