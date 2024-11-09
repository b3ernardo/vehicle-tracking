import { Logger } from '@nestjs/common';

const logger = new Logger('TCP');

export function parseMsg(packet: string) {
  if (packet.length !== 24 && packet.length !== 70) {
    logger.error(`Invalid message length: ${packet.length}`);
    return;
  }

  const header = packet.slice(0, 4);
  const deviceId = packet.slice(4, 10);
  const type = packet.slice(10, 12);
  const payload = packet.slice(12, packet.length - 4);
  const footer = packet.slice(packet.length - 4, packet.length);

  if (header !== '50F7') {
    logger.error('Invalid header');
    return;
  }

  if (footer !== '73C4') {
    logger.error('Invalid footer');
    return;
  }

  return {
    header,
    deviceId: parseInt(deviceId, 16),
    type: parseInt(type, 16),
    payload,
    footer,
  };
}
