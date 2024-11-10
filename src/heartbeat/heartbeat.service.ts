import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as net from 'net';

@Injectable()
export class HeartbeatService {
  private readonly logger = new Logger('Heartbeat');

  // @Cron('*/10 * * * * *')
  @Cron('*/2 * * * *')
  handleCron() {
    this.sendHeartbeat();
  }

  private sendHeartbeat() {
    const heartbeatExample = '50F70A3F730150494E4773C4';
    const tcpPort = Number(process.env.TCP_PORT) || 8080;

    const client = new net.Socket();
    client.connect(tcpPort, 'localhost', () => {
      client.write(Buffer.from(heartbeatExample, 'hex'));
      this.logger.log('Heartbeat sent');
      client.end();
    });

    client.on('error', (err) => {
      this.logger.error(`Error sending heartbeat: ${err.message}`);
    });

    client.on('end', () => {
      this.logger.log('Connection closed');
    });
  }
}
