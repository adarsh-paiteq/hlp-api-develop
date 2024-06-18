import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './shared/auth/auth.module';
import { UsersModule } from './users/users.module';
import { StorageService } from './shared/services/storage/storage.service';
import { PukModule } from './puk/puk.module';
import { UploadsModule } from './uploads/uploads.module';
import { EmailService } from './shared/services/email/email.service';
import { SchedulesModule } from './schedules/schedules.module';
import { ScheduleSessionsModule } from './schedule-sessions/schedule-sessions.module';
import { StreaksModule } from './streaks/streaks.module';
import { RewardsModule } from './rewards/rewards.module';
import { CommunityModule } from './community/community.module';
import { BullBoardMiddleware } from '@core/middlewares/bull-board.middleware';
import { MembershipStagesModule } from './membership-stages/membership-stages.module';
import { MembershipLevelsModule } from './membership-levels/membership-levels.module';
import { ActionsModule } from './actions/actions.module';
import { TrophiesModule } from './trophies/trophies.module';
import { ChallengesModule } from './challenges/challenges.module';
import { BonusesModule } from './bonuses/bonuses.module';
import { CheckinsModule } from './checkins/checkins.module';
import { ToolkitModule } from './toolkits/toolkit.module';
import { GoalsModule } from './goals/goals.module';
import { UtilsModule } from './utils/utils.module';
import { ChannelsModule } from './channels/channels.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GamificationsModule } from './gamifications/gamifications.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { ServiceOfferPurchasesModule } from './service-offer-purchases/service-offer-purchases.module';
import { ToolkitCategoriesModule } from './toolkit-categories/toolkit-categories.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { CoreModule } from '@core/core.module';
import { EmailsModule } from './emails/emails.module';
import { FormPageQuestionsModule } from './form-page-questions/form-page-questions.module';
import { RobotsModule } from './robots/robots.module';
import { UserSessionLogsModule } from './user-session-logs/user-session-logs.module';
import { UserRobotLogsModule } from './user-robot-logs/user-robot-logs.module';
import { HttpBasicAuth } from '@core/middlewares/http-auth.middleware';
import { ClsMiddleware } from 'nestjs-cls';
import { PurchasedReminderTonesModule } from './purchased-reminder-tones/purchased-reminder-tones.module';
import { UserMoodChecksModule } from './user-mood-checks/user-mood-checks.module';
import { AdminPostReadsModule } from './admin-post-reads/admin-post-reads.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ContentEditorsModule } from './content-editors/content-editors.module';
import { InsightsModule } from './insights/insights.module';
import { HealthModule } from './health/health.module';
import { ServiceOffersModule } from './service-offers/service-offers.module';
import { FaqModule } from './faq/faq.module';
import { ShopItemModule } from './shop-item/shop-item.module';
import { FormsModule } from './forms/forms.module';
import { DoctorsModule } from './doctors/doctors.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { CronScheduleService } from '@shared/services/cron-schedule/cron-schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TreatmentsModule } from './treatments/treatments.module';
import { InvitationsModule } from './invitations/invitations.module';
import { GroupsModule } from './groups/groups.module';
import { VideoCallsModule } from './video-calls/video-calls.module';
import { ChatsModule } from '@chats/chats.module';
import { AppGateway } from '@core/gateways/app.gateway';
import { TreatmentTimelineModule } from './treatment-timeline/treatment-timeline.module';
import { OauthModule } from './oauth/oauth.module';
import { DigidModule } from './digid/digid.module';
import { PsyqModule } from './psyq/psyq.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UsersModule,
    PukModule,
    UploadsModule,
    SchedulesModule,
    ScheduleSessionsModule,
    StreaksModule,
    RewardsModule,
    CommunityModule,
    MembershipStagesModule,
    MembershipLevelsModule,
    ActionsModule,
    TrophiesModule,
    ChallengesModule,
    BonusesModule,
    CheckinsModule,
    ToolkitModule,
    GoalsModule,
    UtilsModule,
    ChannelsModule,
    NotificationsModule,
    GamificationsModule,
    BlogPostsModule,
    ServiceOfferPurchasesModule,
    ToolkitCategoriesModule,
    CampaignsModule,
    EmailsModule,
    FormPageQuestionsModule,
    RobotsModule,
    UserSessionLogsModule,
    UserRobotLogsModule,
    PurchasedReminderTonesModule,
    UserMoodChecksModule,
    AdminPostReadsModule,
    VouchersModule,
    ContentEditorsModule,
    InsightsModule,
    HealthModule,
    ServiceOffersModule,
    FaqModule,
    ShopItemModule,
    FormsModule,
    DoctorsModule,
    OrganisationsModule,
    ScheduleModule.forRoot(),
    TreatmentsModule,
    InvitationsModule,
    GroupsModule,
    VideoCallsModule,
    ChatsModule,
    TreatmentTimelineModule,
    OauthModule,
    DigidModule,
    PsyqModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    StorageService,
    EmailService,
    Logger,
    CronScheduleService,
    AppGateway,
  ],
  exports: [EmailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(HttpBasicAuth, BullBoardMiddleware, ClsMiddleware)
      .forRoutes('/admin/queue');
  }
}
