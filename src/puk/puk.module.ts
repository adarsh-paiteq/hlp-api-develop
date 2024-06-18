import { Module } from '@nestjs/common';
import { PukService } from './puk.service';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { PukRepo } from './puk.repo';
import { PUKProvider } from './puk.provider';
import { PukResolver } from './puk.resolver';
import { PukQueue, registerPukQueue } from './puk.queue';
import { PukProcessor } from './puk.processor';

@Module({
  imports: [registerPukQueue],
  providers: [
    PukQueue,
    PukService,
    HasuraService,
    PukRepo,
    PUKProvider,
    PukResolver,
    PukProcessor,
  ],
  exports: [registerPukQueue, PukQueue],
})
export class PukModule {}
