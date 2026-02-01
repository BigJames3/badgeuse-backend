import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  health() {
    return { status: 'ok' };
  }
}
