import { Injectable } from '@nestjs/common';

@Injectable()
export class ConstructionService {
  health() {
    return { status: 'ok' };
  }
}
