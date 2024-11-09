import { Sft9001Controller } from './sft9001.controller';
import { Sft9001Service } from './sft9001.service';

import { Module } from '@nestjs/common';

@Module({
  controllers: [Sft9001Controller],
  providers: [Sft9001Service],
  exports: [Sft9001Service],
})
export class Sft9001Module {}
