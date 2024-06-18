import { Module } from '@nestjs/common';
import { GamificationsService } from './gamifications.service';
import { GamificationsResolver } from './gamifications.resolver';
import { GamificationsRepo } from './gamifications.repo';
import { GamificationsListener } from './gamifications.listener';
import {
  GamificationsQueue,
  registerGamificationsQueue,
} from './gamifications.queue';
import { AuthModule } from '../shared/auth/auth.module';
import { GamificationsController } from './gamifications.controller';
import { GamificationsProcessor } from './gamifications.processor';

@Module({
  providers: [
    GamificationsResolver,
    GamificationsService,
    GamificationsRepo,
    GamificationsListener,
    GamificationsProcessor,
    GamificationsQueue,
  ],
  imports: [registerGamificationsQueue, AuthModule],
  exports: [registerGamificationsQueue],
  controllers: [GamificationsController],
})
export class GamificationsModule {}
