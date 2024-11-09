import { handleData } from './utils/utils';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class TcpService implements OnModuleInit {
  private tcpServer: net.Server;
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
          handleData(clientSocket, payload);
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
}
