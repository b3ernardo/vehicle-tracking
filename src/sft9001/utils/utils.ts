import { SFT9001 } from '../interfaces/sft9001.interface';

export function parseLocationPayload(
  deviceId: number,
  payload: string,
): SFT9001 {
  return {
    deviceId,
    epochData: new Date(parseInt(payload.slice(0, 8), 16) * 1000),
    direction: parseInt(payload.slice(8, 12), 16) / 100,
    distance: parseInt(payload.slice(12, 20), 16),
    operatingTime: parseInt(payload.slice(20, 28), 16),
    composition: {
      gpsFixed:
        (parseInt(payload.slice(28, 32), 16) & 0b1000000000000000) !== 0
          ? 1
          : 0,
      gpsLive:
        (parseInt(payload.slice(28, 32), 16) & 0b0100000000000000) !== 0
          ? 1
          : 0,
      ignition:
        (parseInt(payload.slice(28, 32), 16) & 0b0010000000000000) !== 0
          ? 1
          : 0,
      latitudeNegative:
        (parseInt(payload.slice(28, 32), 16) & 0b0001000000000000) !== 0
          ? 1
          : 0,
      longitudeNegative:
        (parseInt(payload.slice(28, 32), 16) & 0b0000100000000000) !== 0
          ? 1
          : 0,
      reserved: Array(16).fill(0),
    },
    speed: parseInt(payload.slice(-18, -16), 16),
    latitude: parseInt(payload.slice(-16, -8), 16) / 1000000,
    longitude: parseInt(payload.slice(-8), 16) / 1000000,
  };
}
