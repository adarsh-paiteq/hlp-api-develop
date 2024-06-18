import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseProviders } from './database.provider';
import { Database } from './database.service';

@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders, Database],
  exports: [Database],
})
export class DatabaseModule {}
