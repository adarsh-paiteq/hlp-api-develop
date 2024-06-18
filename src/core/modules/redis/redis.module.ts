import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './redis.module-definition';
import { RedisProvider } from './redis.provider';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisProvider, RedisService],
  exports: [RedisProvider, RedisService],
})
export class RedisModule extends ConfigurableModuleClass {}
