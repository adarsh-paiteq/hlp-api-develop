import { PickType } from '@nestjs/graphql';
import { ActivationEmailData } from './entities/activation-email-data.entity';
import { DaySevenEmailData } from './entities/day-seven-email-data.entity';
import { DayThreeEmailData } from './entities/day-three-email-data.entity';
import { Users } from '@users/users.model';

export class Email<T> {
  subject: string;
  data: T;
}

export class ForgotEmailData {
  name: string;
  link: string;
  description: string;
  buttonName: string;
}

export enum VideoEmailType {
  ACTIVATION_EMAIL = 'Activation Email',
  INTRODUCTION_DAY_THREE = 'Introduction Day Three',
  INTRODUCTION_DAY_SEVEN = 'Introduction Day Seven',
}

export class VideoEmailData {
  email: string;
  videoEmailType: VideoEmailType;
}

export const introductionVideoTableName = new Map<string, string>([
  [VideoEmailType.ACTIVATION_EMAIL, 'activation_email_data'],
  [VideoEmailType.INTRODUCTION_DAY_THREE, 'day_three_email_data'],
  [VideoEmailType.INTRODUCTION_DAY_SEVEN, 'day_seven_email_data'],
]);

export const introductionVideoEmailSubject = new Map<string, string>([
  [VideoEmailType.ACTIVATION_EMAIL, 'Welcome to the HLP app!'],
  [
    VideoEmailType.INTRODUCTION_DAY_THREE,
    'Introduction To Tools/Habits/HLPs VIDEO',
  ],
  [
    VideoEmailType.INTRODUCTION_DAY_SEVEN,
    'Introduction To Community/Challenges VIDEO',
  ],
]);

export type IntroductionVideoData =
  | DayThreeEmailData
  | DaySevenEmailData
  | ActivationEmailData;

export class TeatmentTeamUser extends PickType(Users, [
  'id',
  'user_name',
  'email',
  'role',
  'first_name',
  'last_name',
  'language',
  'full_name',
]) {}

export class TreatmentWithTreatmentUsers extends TeatmentTeamUser {
  treatment_name: string;
}

export class GetLayoutTranslationResponse {
  [key: string]: string;
}

export class GetTranslationResponse extends GetLayoutTranslationResponse {}
