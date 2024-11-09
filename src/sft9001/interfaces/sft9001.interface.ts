export interface SFT9001 {
  deviceId: number;
  epochData: Date;
  direction: number;
  distance: number;
  operatingTime: number;
  composition: {
    gpsFixed: 0 | 1;
    gpsLive: 0 | 1;
    ignition: 0 | 1;
    latitudeNegative: 0 | 1;
    longitudeNegative: 0 | 1;
    reserved: (0 | 1)[];
  };
  speed: number;
  latitude: number;
  longitude: number;
}
