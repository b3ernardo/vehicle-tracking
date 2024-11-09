import { TcpService } from './tcp.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [TcpService],
})
export class TcpModule {}
