import { Logger } from '@nestjs/common';
import * as net from 'net';

const logger = new Logger('TCP');

function parseMsg(packet: string) {
  if (packet.length !== 24 && packet.length !== 66 && packet.length !== 70) {
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
    deviceId: parseInt(deviceId, 16),
    footer,
    header,
    payload,
    type: parseInt(type, 16),
  };
}

export function handleData(clientSocket: net.Socket, data: Buffer) {
  const pingCommandType = 1;
  const pingLocationType = 2;
  const packet = data.toString('hex').toUpperCase();
  const parsedMsg = parseMsg(packet);

  if (!parsedMsg) {
    logger.warn('Message parsing failed');
    clientSocket.end();
    return;
  }

  logger.log(`Data received: ${packet}`);

  if (parsedMsg.type === pingCommandType) {
    const pingAckMsg = `50F701${parsedMsg.payload}73C4`;
    clientSocket.write(Buffer.from(pingAckMsg, 'hex'));
    logger.log(`Ping ACK sent to client: ${pingAckMsg}`);
  }

  if (parsedMsg.type === pingLocationType) {
    // TODO: Tratamendo da mensagem de tipo Location
  }

  clientSocket.end();
}
