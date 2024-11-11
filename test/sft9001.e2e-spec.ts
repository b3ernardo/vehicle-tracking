import { Sft9001Service } from './../src/sft9001/sft9001.service';
import { parseLocationPayload } from './../src/sft9001/utils/utils';

import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('./../src/sft9001/utils/utils', () => ({
  parseLocationPayload: jest.fn(),
}));

describe('Sft9001Service', () => {
  let service: Sft9001Service;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Sft9001Service],
    }).compile();

    service = module.get<Sft9001Service>(Sft9001Service);

    loggerSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveLocationData', () => {
    it('should save location data correctly', () => {
      const mockDeviceId = 1;
      const mockPayload = 'mockPayload';
      const mockLocation = {
        latitude: 50,
        longitude: 50,
        direction: 180,
        distance: 5000,
      };

      (parseLocationPayload as jest.Mock).mockReturnValue(mockLocation);

      service.saveLocationData(mockDeviceId, mockPayload);

      expect(service.getLocationData(mockDeviceId)).toEqual(mockLocation);
    });

    it('should reset the odometer when the value exceeds the limit', () => {
      const mockDeviceId = 1;
      const mockPayload = 'mockPayload';
      const mockLocation = {
        latitude: 50,
        longitude: 50,
        direction: 180,
        distance: 100000001,
      };

      (parseLocationPayload as jest.Mock).mockReturnValue(mockLocation);

      service.saveLocationData(mockDeviceId, mockPayload);

      const savedLocation = service.getLocationData(mockDeviceId);
      expect(savedLocation?.distance).toBe(0);

      expect(loggerSpy).toHaveBeenCalledWith(
        'The odometer has reached the maximum value; Resetting to 0',
      );
    });

    it('should log a warning when the latitude is invalid', () => {
      const mockDeviceId = 1;
      const mockPayload = 'mockPayload';
      const mockLocation = {
        latitude: 1000,
        longitude: 50,
        direction: 180,
        distance: 5000,
      };

      (parseLocationPayload as jest.Mock).mockReturnValue(mockLocation);

      service.saveLocationData(mockDeviceId, mockPayload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Latitude out of range: 1000; Expected between -90 and 90`,
      );
    });

    it('should log a warning when the longitude is invalid', () => {
      const mockDeviceId = 1;
      const mockPayload = 'mockPayload';
      const mockLocation = {
        latitude: 50,
        longitude: 2000,
        direction: 180,
        distance: 5000,
      };

      (parseLocationPayload as jest.Mock).mockReturnValue(mockLocation);

      service.saveLocationData(mockDeviceId, mockPayload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Longitude out of range: 2000; Expected between -180 and 180`,
      );
    });

    it('should log a warning when the direction is invalid', () => {
      const mockDeviceId = 1;
      const mockPayload = 'mockPayload';
      const mockLocation = {
        latitude: 50,
        longitude: 50,
        direction: 400,
        distance: 5000,
      };

      (parseLocationPayload as jest.Mock).mockReturnValue(mockLocation);

      service.saveLocationData(mockDeviceId, mockPayload);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Direction out of range: 400; Expected between 0 and 359.99`,
      );
    });
  });
});
