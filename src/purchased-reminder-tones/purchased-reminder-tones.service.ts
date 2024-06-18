import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GetReminderTonesListResponse,
  GetReminderTonesResponseDto,
} from './dto/get-reminder-tones.dto';
import { PurchasedReminderTonesRepo } from './purchased-reminder-tones.repo';
import { ReminderTonePurchasedEvent, UserEvent } from '../users/user.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommonResponseMessage } from '../users/users.model';
import { UsersRepo } from '../users/users.repo';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class PurchasedReminderTonesService {
  constructor(
    private readonly reminderTonesRepo: PurchasedReminderTonesRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly userRepo: UsersRepo,
    private readonly translationservice: TranslationService,
  ) {}
  async getReminderTones(userId: string): Promise<GetReminderTonesResponseDto> {
    const [reminderTones, notificationSettings] = await Promise.all([
      this.reminderTonesRepo.getPurchasedTones(userId),
      this.reminderTonesRepo.getNotificationSettings(userId),
    ]);
    if (!notificationSettings) {
      throw new NotFoundException(
        `purchased-reminder-tones.user_notification_settings_not_found`,
      );
    }
    const mappedTones = reminderTones.map((reminderTone) => ({
      ...reminderTone,
      enabled: reminderTone.file_name === notificationSettings.reminder_sound,
    }));
    return {
      reminderTones: mappedTones,
    };
  }

  async getReminderTonesList(
    userId: string,
  ): Promise<GetReminderTonesListResponse> {
    const [usersWithMembership, reminderTones] = await Promise.all([
      this.reminderTonesRepo.getUserAndMembershipStage(userId),
      this.reminderTonesRepo.getReminderTonesList(userId),
    ]);
    if (!usersWithMembership) {
      throw new NotFoundException(
        `purchased-reminder-tones.user_membership_not_found`,
      );
    }

    if (!reminderTones.length) {
      throw new NotFoundException(
        `purchased-reminder-tones.reminder_tone_not_found`,
      );
    }
    const membershipStageIds = [];
    if (usersWithMembership.user_membership_stages.length) {
      const mappedIds = usersWithMembership.user_membership_stages.map(
        (id) => id.membership_stage_id,
      );
      membershipStageIds.push(...mappedIds);
    }
    return {
      users: usersWithMembership,
      reminder_tones: reminderTones,
      unlocked_membership_stages: membershipStageIds,
    };
  }

  public async purchaseReminderTone(
    userId: string,
    reminderToneId: string,
  ): Promise<CommonResponseMessage> {
    const userPurchasedTone =
      await this.reminderTonesRepo.getUserReminderTonePurchaseHistory(
        userId,
        reminderToneId,
      );
    if (userPurchasedTone.length) {
      throw new BadRequestException(
        `purchased-reminder-tones.already_purchased_reminder_tone`,
      );
    }
    const user = await this.userRepo.getUserById(userId);
    const reminderTone = await this.userRepo.getReminderTone(reminderToneId);
    if (!reminderTone) {
      throw new NotFoundException(
        `purchased-reminder-tones.reminder_tone_not_found`,
      );
    }
    if (
      user.hlp_reward_points_balance <
      reminderTone.hlp_points_needed_to_purchase_this_tone
    ) {
      throw new BadRequestException(
        `purchased-reminder-tones.insufficient_coins`,
      );
    }
    const response = await this.reminderTonesRepo.addPurchaseReminderTone(
      userId,
      reminderToneId,
    );
    this.eventEmitter.emit(
      UserEvent.REMINDER_TONE_PURCHASED,
      new ReminderTonePurchasedEvent(response),
    );
    return {
      message: this.translationservice.translate(
        `purchased-reminder-tones.reminder_tone_purchased_successfully`,
      ),
    };
  }
}
