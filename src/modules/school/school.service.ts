import { Injectable } from '@nestjs/common';

@Injectable()
export class SchoolService {
  health() {
    return { status: 'ok' };
  }
}
