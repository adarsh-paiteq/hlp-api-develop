import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserReminderTonePurchase {
  id: string;
  reminder_tone_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
