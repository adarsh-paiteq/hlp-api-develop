import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import {
  NotificationMetadata,
  UserNotificationType,
} from '../entities/user-notifications.entity';
import { Translation } from '@utils/utils.dto';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { Users } from '@users/users.model';
import { Doctor } from '@doctors/entities/doctors.entity';

export class SaveUserNotificationDto {
  user_id: string;
  title: string;
  body: string;
  account_id?: string;
  page?: string;
  type?: UserNotificationType;
  invitation_id?: string;
  metadata?: NotificationMetadata;
  translations?: Translation;
}

@InputType()
export class UserNotificationSettingInput {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allow_community_email_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_community_push_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_informational_email_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_post_reaction_email_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_post_reaction_push_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_reminder_email_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_reminder_push_notification: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  play_reminder_sound: boolean;
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allow_calender_events: boolean;
}

@ArgsType()
export class UserNotificationSettingArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userNotificationSettingId: string;
}

@ArgsType()
export class UserNotificationArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userNotificationId: string;
}

export class NotificationContentsAndHeadings {
  headings: {
    en: string;
    nl: string;
  };
  contents: {
    en: string;
    nl: string;
  };
}
export class GetScheduleWithToolKitTitle extends ScheduleEntity {
  toolkit_title: string;
}

export class ScheduleWithUser extends ScheduleEntity {
  users?: Users;
  doctors?: Doctor;
}
