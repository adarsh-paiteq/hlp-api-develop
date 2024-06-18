import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ToolkitStreak {
  id: string;
  tool_kit: string;
  streak_count: number;
  streak_points: number;
  created_at: string;
  updated_at: string;
  sequence_number: number;
}
