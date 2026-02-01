import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationService {
  isAllowed() {
    return true;
  }
}
