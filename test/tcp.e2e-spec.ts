import { Sft9001Service } from './../src/sft9001/sft9001.service';
import { TcpService } from './../src/tcp/tcp.service';

import { Test, TestingModule } from '@nestjs/testing';
import * as childProcess from 'child_process';
import * as net from 'net';

jest.mock('./../src/sft9001/sft9001.service');

describe('TcpService', () => {
  let service: TcpService;
  const tcpPort = Number(process.env.TCP_PORT) || 8080;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TcpService, Sft9001Service],
    }).compile();

    service = module.get<TcpService>(TcpService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects the location', async () => {
    const input =
      '50F70A3F73025EFCF950156F017D784000008CA0F80084003C013026A1029E72BD73C4';
    const command = `echo -n ${input} | xxd -r -p | nc -v localhost ${tcpPort}`;

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const client = new net.Socket();
        client.once('connect', () => {
          client.destroy();
          clearInterval(interval);
          resolve();
        });
        client.connect(tcpPort, 'localhost');
      }, 500);
    });

    const output = childProcess.execSync(command, { encoding: 'utf8' });

    const expectedOutput = 'Location data rejected; Ping required';
    expect(output.trim()).toEqual(expectedOutput);
  });

  it('ping command should return correct ACK and receives location correctly', async () => {
    const input = '50F70A3F730150494E4773C4';
    const command = `echo -n ${input} | xxd -r -p | nc -v localhost ${tcpPort}`;

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const client = new net.Socket();
        client.once('connect', () => {
          client.destroy();
          clearInterval(interval);
          resolve();
        });
        client.connect(tcpPort, 'localhost');
      }, 500);
    });

    const output = childProcess.execSync(command, { encoding: 'utf8' });

    const expectedOutput = 'Ping ACK received: 50F70150494E4773C4';
    expect(output.trim()).toEqual(expectedOutput);

    const input2 =
      '50F70A3F73025EFCF950156F017D784000008CA0F80084003C013026A1029E72BD73C4';
    const command2 = `echo -n ${input2} | xxd -r -p | nc -v localhost ${tcpPort}`;

    const output2 = childProcess.execSync(command2, { encoding: 'utf8' });

    const expectedOutput2 = 'Location received';
    expect(output2.trim()).toEqual(expectedOutput2);
  });
});
