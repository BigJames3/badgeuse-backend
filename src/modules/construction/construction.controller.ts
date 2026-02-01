import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConstructionService } from './construction.service';

@ApiTags('construction')
@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Get('health')
  health() {
    return this.constructionService.health();
  }
}
