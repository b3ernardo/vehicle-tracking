import { TcpModule } from './tcp/tcp.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Module } from '@nestjs/common';

@Module({
  controllers: [AppController],
  imports: [TcpModule],
  providers: [AppService],
})
export class AppModule {}
