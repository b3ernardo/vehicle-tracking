import { AuthModule } from './auth/auth.module';
import { HeartbeatModule } from './heartbeat/heartbeat.module';
import { Sft9001Module } from './sft9001/sft9001.module';
import { TcpModule } from './tcp/tcp.module';
import { UsersModule } from './users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HeartbeatModule,
    TcpModule,
    Sft9001Module,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
