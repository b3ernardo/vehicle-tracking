import { SFT9001 } from './interfaces/sft9001.interface';
import { Sft9001Service } from './sft9001.service';

import {
  Controller,
  Get,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';

@Controller('api/v1')
export class Sft9001Controller {
  constructor(private readonly sft9001Service: Sft9001Service) {}

  @Get('location/:device_id')
  getLocation(@Param('device_id', ParseIntPipe) deviceId: number): SFT9001 {
    const locationData = this.sft9001Service.getLocationData(deviceId);

    if (!locationData) {
      throw new NotFoundException(
        `Location data for device ID ${deviceId} not found`,
      );
    }

    return locationData;
  }
}
