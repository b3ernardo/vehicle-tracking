import { Sft9001Module } from '../sft9001/sft9001.module';

import { TcpService } from './tcp.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [Sft9001Module],
  providers: [TcpService],
})
export class TcpModule {}
