import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HabitToolDeletedFromAgenda {
  created_at: string;
  updated_at: string;
  day_id: string;
  habit_id: string;
  id: string;
  user_id: string;
}
