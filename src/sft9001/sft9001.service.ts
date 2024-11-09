import { SFT9001 } from './interfaces/sft9001.interface';
import { parseLocationPayload } from './utils/utils';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class Sft9001Service {
  private readonly logger = new Logger('SFT9001');
  private locationData = new Map<number, SFT9001>();

  saveLocationData(deviceId: number, payload: string) {
    const location = parseLocationPayload(deviceId, payload);
    this.locationData.set(deviceId, location);
    this.logger.log('Location added to database');
  }

  getLocationData(deviceId: number): SFT9001 | undefined {
    return this.locationData.get(deviceId);
  }
}
