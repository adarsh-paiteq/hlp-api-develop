import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class Form {
  @Field(() => String)
  id: string;
  @Field(() => GraphQLInt)
  hlp_reward_points: number;
  @Field(() => String)
  description: string;
  @Field(() => String)
  title: string;
  @Field(() => Boolean)
  is_results_page_enabled: boolean;
  @Field(() => String)
  created_at: string;
  @Field(() => String)
  updated_at: string;
  @HideField()
  translations?: Translation;
}
