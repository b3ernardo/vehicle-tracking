import { SFT9001 } from './interfaces/sft9001.interface';
import { parseLocationPayload } from './utils/utils';

import { Injectable } from '@nestjs/common';

@Injectable()
export class Sft9001Service {
  private locationData = new Map<number, SFT9001>();

  saveLocationData(deviceId: number, payload: string) {
    const location = parseLocationPayload(deviceId, payload);
    this.locationData.set(deviceId, location);
  }

  getLocationData(deviceId: number): SFT9001 | undefined {
    return this.locationData.get(deviceId);
  }
}
