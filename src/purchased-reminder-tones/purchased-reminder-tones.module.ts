import { Module } from '@nestjs/common';
import { PurchasedReminderTonesService } from './purchased-reminder-tones.service';
import { PurchasedReminderTonesResolver } from './purchased-reminder-tones.resolver';
import { PurchasedReminderTonesRepo } from './purchased-reminder-tones.repo';
import { AuthModule } from '../shared/auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [
    PurchasedReminderTonesResolver,
    PurchasedReminderTonesService,
    PurchasedReminderTonesRepo,
  ],
  imports: [AuthModule, UsersModule],
})
export class PurchasedReminderTonesModule {}
