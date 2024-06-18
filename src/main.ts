import { start } from './tracing';
start();

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import configure from './app';
import { Logger } from '@nestjs/common';
import { EnvVariable } from '@core/configs/config';
import { getLogger } from './core/configs/logger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogger(),
    rawBody: true,
    cors: { origin: '*' },
  });
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>(EnvVariable.NODE_ENV);
  const logger = app.get(Logger);
  const port = configService.get(EnvVariable.PORT);
  configure(app, logger);
  await app.listen(port);
  logger.log(`Server started on port ${port} in ${nodeEnv}`);
}
bootstrap();
