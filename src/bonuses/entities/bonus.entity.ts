import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  Int,
  HideField,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Bonuses {
  @Field(() => Int)
  hlp_reward_points: number;
  @Field(() => Int, { nullable: true })
  number_of_check_ins_to_be_completed?: number;
  @Field(() => Int, { nullable: true })
  number_of_tools_to_be_completed?: number;
  @Field(() => Int, { nullable: true })
  number_of_trophies_to_be_earned?: number;
  bonus_type: string;
  emoji: string;
  @Field(() => String, { nullable: true })
  emoji_image_file_path?: string;
  @Field(() => String, { nullable: true })
  emoji_image_id?: string;
  @Field(() => String, { nullable: true })
  emoji_image_url?: string;
  short_description: string;
  title: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @Field(() => String, { nullable: true })
  checkin_id?: string;
  @Field(() => String)
  id: string;
  @Field(() => String)
  membership_stage_id: string;
  @Field(() => String, { nullable: true })
  toolkit_id?: string;
  @HideField()
  translations?: Translation;
}
