import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { UserNotificationSettings } from '../users/users.dto';
import {
  GetUsersAndMembershipStage,
  ReminderTonesAndTonePurchase,
} from './dto/get-reminder-tones.dto';
import { ReminderTone } from './entities/reminder-tone.entity';
import { UserReminderTonePurchase } from './entities/user-reminder-tone-purchases.entity';

@Injectable()
export class PurchasedReminderTonesRepo {
  constructor(private readonly database: Database) {}

  async getPurchasedTones(userId: string): Promise<ReminderTone[]> {
    const query = `SELECT reminder_tones.* FROM user_reminder_tone_purchases
    LEFT JOIN reminder_tones ON reminder_tones.id=user_reminder_tone_purchases.reminder_tone_id
    WHERE user_reminder_tone_purchases.user_id=$1
    ORDER BY user_reminder_tone_purchases.created_at DESC`;
    const tones = await this.database.query<ReminderTone>(query, [userId]);
    return tones;
  }

  async getNotificationSettings(
    userId: string,
  ): Promise<UserNotificationSettings> {
    const query = `SELECT * FROM user_notification_settings WHERE user_id=$1`;
    const [notficationSetting] =
      await this.database.query<UserNotificationSettings>(query, [userId]);
    return notficationSetting;
  }

  async getUserAndMembershipStage(
    userId: string,
  ): Promise<GetUsersAndMembershipStage> {
    const query = `SELECT users.*,
    ROW_TO_JSON(membership_stages.*) AS membership_stages, 
    COALESCE(JSON_AGG(user_membership_stages.*) FILTER (WHERE user_membership_stages.id IS NOT NULL),'[]') AS user_membership_stages
    FROM users
    LEFT JOIN membership_stages ON membership_stages.id=users.current_membership_stage_id
    LEFT JOIN user_membership_stages ON user_membership_stages.user_id=$1
    WHERE users.id=$1
    GROUP BY users.id, membership_stages.id;
  `;
    const [usersWithMembership] =
      await this.database.query<GetUsersAndMembershipStage>(query, [userId]);
    return usersWithMembership;
  }

  async getReminderTonesList(
    userId: string,
  ): Promise<ReminderTonesAndTonePurchase[]> {
    const query = `SELECT reminder_tones.*,
    COALESCE(ROW_TO_JSON(membership_stages.*), 'null') AS membership_stages,
    COALESCE(JSON_AGG(user_reminder_tone_purchases.*) FILTER (WHERE user_reminder_tone_purchases.id IS NOT NULL),'[]') AS user_reminder_tone_purchases
    FROM reminder_tones
    LEFT JOIN membership_stages ON membership_stages.id = reminder_tones.membership_stage_id
    LEFT JOIN user_reminder_tone_purchases ON user_reminder_tone_purchases.reminder_tone_id = reminder_tones.id AND user_reminder_tone_purchases.user_id = $1
    GROUP BY reminder_tones.id, membership_stages.id
    ORDER BY reminder_tones.created_at DESC
    `;
    const reminderTones =
      await this.database.query<ReminderTonesAndTonePurchase>(query, [userId]);
    return reminderTones;
  }

  async getUserReminderTonePurchaseHistory(
    userId: string,
    reminderToneId: string,
  ): Promise<UserReminderTonePurchase[]> {
    const query = `SELECT * FROM user_reminder_tone_purchases WHERE user_id=$1 AND reminder_tone_id=$2`;
    const purchaseReminderTone =
      await this.database.query<UserReminderTonePurchase>(query, [
        userId,
        reminderToneId,
      ]);
    return purchaseReminderTone;
  }

  async addPurchaseReminderTone(
    userId: string,
    reminderToneId: string,
  ): Promise<UserReminderTonePurchase> {
    const query = `INSERT INTO user_reminder_tone_purchases(user_id, reminder_tone_id)
    VALUES ($1, $2) RETURNING *`;
    const [purchaseReminderToneNew] =
      await this.database.query<UserReminderTonePurchase>(query, [
        userId,
        reminderToneId,
      ]);
    return purchaseReminderToneNew;
  }
}
