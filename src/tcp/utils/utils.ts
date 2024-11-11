import {
  FOOTER,
  HEADER,
  LOCATION_MSG_LENGTH,
  PING_MSG_LENGTH,
} from '../../common/constants';

import { Logger } from '@nestjs/common';

const logger = new Logger('TCP');

export function parseMsg(packet: string) {
  if (
    packet.length !== PING_MSG_LENGTH &&
    packet.length !== LOCATION_MSG_LENGTH
  ) {
    logger.error(`Invalid message length: ${packet.length}`);
    return;
  }

  const header = packet.slice(0, 4);
  const deviceId = packet.slice(4, 10);
  const type = packet.slice(10, 12);
  const payload = packet.slice(12, -4);
  const footer = packet.slice(-4);

  if (header !== HEADER) {
    logger.error('Invalid header');
    return;
  }

  if (footer !== FOOTER) {
    logger.error('Invalid footer');
    return;
  }

  return {
    header,
    deviceId: parseInt(deviceId, 16),
    type,
    payload,
    footer,
  };
}
