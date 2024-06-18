import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepo } from './users.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { AuthModule } from '../shared/auth/auth.module';
import { EmailService } from '../shared/services/email/email.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { UsersEventListener } from './users.listener';
import { StreaksService } from '../streaks/streaks.service';
import { StreaksRepo } from '../streaks/streaks.repo';
import { ScheduleSessionsRepo } from '../schedule-sessions/schedule-sessions.repo';
import { registerUsersQueue, UsersQueue } from './users.queue';
import { UsersProcessor } from './users.processor';

import { RewardsModule } from '../rewards/rewards.module';
import { MembershipLevelsModule } from '../membership-levels/membership-levels.module';
import { MembershipStagesModule } from '../membership-stages/membership-stages.module';
import { TrophiesModule } from '../trophies/trophies.module';
import { BonusesModule } from '../bonuses/bonuses.module';
import { StripeService } from '../shared/services/stripe/stripe.service';
import { ToolkitModule } from '../toolkits/toolkit.module';
import { FirebaseDynamicLinksService } from '../shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { UsersResolver } from './users.resolver';
import { EmailsModule } from '../emails/emails.module';
import { PukModule } from '../puk/puk.module';
import { ContentEditorsModule } from '../content-editors/content-editors.module';
import { ContentEditorsRepo } from '../content-editors/content-editors.repo';
import { UtilsModule } from '../utils/utils.module';
import { MollieService } from '@shared/services/mollie/mollie.service';

@Module({
  imports: [
    ToolkitModule,
    AuthModule,
    SchedulesModule,
    registerUsersQueue,
    RewardsModule,
    MembershipLevelsModule,
    forwardRef(() => MembershipStagesModule),
    TrophiesModule,
    BonusesModule,
    EmailsModule,
    PukModule,
    ContentEditorsModule,
    UtilsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepo,
    HasuraService,
    EmailService,
    UsersEventListener,
    StreaksService,
    StreaksRepo,
    ScheduleSessionsRepo,
    UsersQueue,
    UsersProcessor,
    StripeService,
    FirebaseDynamicLinksService,
    UsersResolver,
    ContentEditorsRepo,
    MollieService,
  ],
  exports: [registerUsersQueue, UsersRepo, UsersService],
})
export class UsersModule {}
