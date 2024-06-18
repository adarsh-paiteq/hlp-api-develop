import { ObjectType, registerEnumType } from '@nestjs/graphql';

export enum FeelingType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
}

registerEnumType(FeelingType, { name: 'FeelingType' });

@ObjectType()
export class UserMoodCheck {
  id: string;
  user_id: string;
  category_id: string;
  sub_category_ids: string[];
  date: Date;
  feeling_type: FeelingType;
  created_at: string;
  updated_at: string;
}
