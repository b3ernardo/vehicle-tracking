import { HeartbeatService } from './heartbeat.service';

import { Module } from '@nestjs/common';

@Module({
  providers: [HeartbeatService],
})
export class HeartbeatModule {}
