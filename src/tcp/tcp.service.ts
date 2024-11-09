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
          // Faz o processamento do dado recebido para o respectivo cliente
          this.handleIncomingData(clientSocket, payload);
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
      this.logger.log(`TCP listening - localhost ${tcpPort}`);
    });
  }

  private handleIncomingData(clientSocket: net.Socket, data: Buffer) {
    const pingCommandType = 1;
    const packet = data.toString('hex').toUpperCase();
    // Faz o parse da mensagem recebida
    const parsedMsg = this.parseMsg(packet);

    if (!parsedMsg) {
      this.logger.warn('Message parsing failed');
      clientSocket.end();
      return;
    }

    this.logger.log(`Data received: ${packet}`);

    // Para mensagens do tipo Ping, envia o Ping ACK ao cliente
    if (parsedMsg.type === pingCommandType) {
      const pingAckMsg = `50F701${parsedMsg.payload}73C4`;
      clientSocket.write(Buffer.from(pingAckMsg, 'hex'));
      this.logger.log(`Ping ACK sent to client: ${pingAckMsg}`);
    }
    clientSocket.end();
  }

  private parseMsg(packet: string) {
    if (packet.length !== 24) {
      this.logger.error(`Invalid message length: ${packet.length}`);
      return;
    }

    // Extrai cada informação do pacote em hexadecimal
    const header = packet.slice(0, 4);
    const deviceId = packet.slice(4, 10);
    const type = packet.slice(10, 12);
    const payload = packet.slice(12, packet.length - 4);
    const footer = packet.slice(packet.length - 4, packet.length);

    if (header !== '50F7') {
      this.logger.error('Invalid header');
      return;
    }

    if (footer !== '73C4') {
      this.logger.error('Invalid footer');
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
}
