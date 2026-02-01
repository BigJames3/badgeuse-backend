import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SchoolService } from './school.service';

@ApiTags('schools')
@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get('health')
  health() {
    return this.schoolService.health();
  }
}
