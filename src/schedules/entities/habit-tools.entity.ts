import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HabitTool {
  created_at: string;
  updated_at: string;
  day_id: string;
  habit_tool_kit_id: string;
  id: string;
  tool_kit_id: string;
}
