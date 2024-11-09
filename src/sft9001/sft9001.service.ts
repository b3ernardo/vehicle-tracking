import {
  LATITUDE_MIN,
  LATITUDE_MAX,
  LONGITUDE_MIN,
  LONGITUDE_MAX,
  DIRECTION_MIN,
  DIRECTION_MAX,
  ODOMETER_MAX_VALUE,
} from '../common/constants';
import { SFT9001 } from './interfaces/sft9001.interface';
import { parseLocationPayload } from './utils/utils';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class Sft9001Service {
  private readonly logger = new Logger('SFT9001');
  private locationData = new Map<number, SFT9001>();

  saveLocationData(deviceId: number, payload: string) {
    const location = parseLocationPayload(deviceId, payload);

    this.validateDistance(location);
    this.validateLatitude(location.latitude);
    this.validateLongitude(location.longitude);
    this.validateDirection(location.direction);

    this.locationData.set(deviceId, location);
    this.logger.log('Location added to database');
  }

  private validateDistance(location: SFT9001) {
    if (location.distance > ODOMETER_MAX_VALUE) {
      this.logger.warn(
        `The odometer has reached the maximum value; Resetting to 0`,
      );
      location.distance = 0;
    }
  }

  private validateLatitude(latitude: number) {
    if (latitude < LATITUDE_MIN || latitude > LATITUDE_MAX) {
      this.logger.warn(
        `Latitude out of range: ${latitude}; Expected between ${LATITUDE_MIN} and ${LATITUDE_MAX}`,
      );
    }
  }

  private validateLongitude(longitude: number) {
    if (longitude < LONGITUDE_MIN || longitude > LONGITUDE_MAX) {
      this.logger.warn(
        `Longitude out of range: ${longitude}; Expected between ${LONGITUDE_MIN} and ${LONGITUDE_MAX}`,
      );
    }
  }

  private validateDirection(direction: number) {
    if (direction < DIRECTION_MIN || direction > DIRECTION_MAX) {
      this.logger.warn(
        `Direction out of range: ${direction}; Expected between ${DIRECTION_MIN} and ${DIRECTION_MAX}`,
      );
    }
  }

  getLocationData(deviceId: number): SFT9001 | undefined {
    return this.locationData.get(deviceId);
  }
}
