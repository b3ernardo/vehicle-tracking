import {
  PING_COMMAND_TYPE,
  LOCATION_COMMAND_TYPE,
  HEADER,
  FOOTER,
} from '../common/constants';
import { Sft9001Service } from '../sft9001/sft9001.service';
import { parseMsg } from './utils/utils';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class TcpService implements OnModuleInit {
  constructor(private readonly sft9001Service: Sft9001Service) {}

  private tcpServer: net.Server;
  private readonly activeDevices = new Map<number, number>();
  private readonly logger = new Logger('TCP');

  onModuleInit() {
    const tcpPort = Number(process.env.TCP_PORT) || 8080;
    if (isNaN(tcpPort) || tcpPort < 1 || tcpPort > 65535) {
      this.logger.error('Invalid TCP port provided');
      return;
    }
    this.startTcpServer(tcpPort);
  }

  private startTcpServer(tcpPort: number) {
    this.tcpServer = net.createServer((clientSocket: net.Socket) => {
      this.logger.log('New client connected to TCP server');

      clientSocket.on('data', (payload: Buffer) => {
        try {
          this.handleData(clientSocket, payload);
        } catch (error) {
          this.logger.error(`Error handling data: ${error.message}`);
        }
      });

      clientSocket.on('end', () => this.logger.log('Client disconnected'));

      clientSocket.on('error', (error) =>
        this.logger.error(`Client connection error: ${error.message}`),
      );
    });

    this.tcpServer.listen(tcpPort, () => {
      this.logger.log(`TCP listening on localhost ${tcpPort}`);
    });
  }

  private handleData(clientSocket: net.Socket, data: Buffer) {
    const packet = data.toString('hex').toUpperCase();
    const parsedMsg = parseMsg(packet);

    if (!parsedMsg) {
      this.logger.warn('Message parsing failed');
      clientSocket.end();
      return;
    }

    this.logger.log(`Data received: ${packet}`);

    if (parsedMsg.type === PING_COMMAND_TYPE) {
      // Atualiza o timestamp do dispositivo no Map
      this.activeDevices.set(parsedMsg.deviceId, Date.now());

      const pingAckMsg = `${HEADER}${parsedMsg.payload}${FOOTER}`;
      clientSocket.write(
        Buffer.from('Ping ACK received: ' + pingAckMsg.toUpperCase()),
      );
      this.logger.log(`Ping ACK sent to client: ${pingAckMsg}`);
    }

    if (parsedMsg.type === LOCATION_COMMAND_TYPE) {
      // Verifica se o último ping foi há menos de 2 minutos
      const lastPing = this.activeDevices.get(parsedMsg.deviceId);
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

      if (lastPing && lastPing >= twoMinutesAgo) {
        this.sft9001Service.saveLocationData(
          parsedMsg.deviceId,
          parsedMsg.payload,
        );
        clientSocket.write(Buffer.from('Location received'));
        this.logger.log(
          `Location data saved for deviceId ${parsedMsg.deviceId}`,
        );
      } else {
        clientSocket.write(
          Buffer.from('Location data rejected; Ping required'),
        );
        this.logger.warn(
          `Location data rejected for deviceId ${parsedMsg.deviceId}; Ping required`,
        );
      }
    }

    clientSocket.end();
  }
}
