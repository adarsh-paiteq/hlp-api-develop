import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ScheduleReminder {
  is_reminder_disabled: boolean;
  created_at: string;
  reminder_time: string;
  updated_at: string;
  id: string;
  schedule_id: string;
  user_id: string;
}
