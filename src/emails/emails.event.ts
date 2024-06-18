import { Users } from '../users/users.model';

export enum EmailsEvent {
  FORGET_PASSWORD = '[EMAIL] FORGET PASSWORD',
  FORGET_PIN = '[EMAIL] FORGET PIN',
  VERIFY_EMAIL = '[EMAIL] VERIFY EMAIL',
  INACTIVITY_REFRESHER_EMAIL = '[EMAIL] INACTIVITY_REFRESHER_EMAIL',
}

export class ForgetPasswordEvent {
  constructor(public user: Users, public shortLink: string) {}
}

export class ForgetPinEvent extends ForgetPasswordEvent {}

export class VerifyEmailEvent extends ForgetPasswordEvent {}

export class InactivityRefresherEmailEvent {
  constructor(public userId: string) {}
}
