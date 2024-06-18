import { Module } from '@nestjs/common';
import { BonusesService } from './bonuses.service';
import { BonusesController } from './bonuses.controller';
import { BonusesRepo } from './bonuses.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { AuthModule } from '../shared/auth/auth.module';
import { BonusesListener } from './bonuses.listener';
import { BonusesQueue, registerBonusesQueue } from './bonuses.queue';
import { BonusesProcessor } from './bonuses.processor';
import { BonusesResolver } from './bonuses.resolver';

@Module({
  controllers: [BonusesController],
  providers: [
    BonusesService,
    BonusesRepo,
    HasuraService,
    BonusesListener,
    BonusesProcessor,
    BonusesQueue,
    BonusesResolver,
  ],
  exports: [BonusesService, registerBonusesQueue],
  imports: [AuthModule, registerBonusesQueue],
})
export class BonusesModule {}
