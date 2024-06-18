import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { FeelingType } from './user-mood-check.entity';
import { GraphQLInt } from 'graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class MoodCheckCategory {
  feeling_type: FeelingType;
  @Field(() => String)
  background_colour: string;
  @Field(() => String)
  file_path: string;
  @Field(() => String)
  image_id: string;
  @Field(() => String)
  image_url: string;
  @Field(() => String)
  title: string;
  @Field(() => String)
  created_at: string;
  @Field(() => String)
  updated_at: string;
  @Field(() => String)
  id: string;
  @Field(() => GraphQLInt)
  ranking: number;
  @HideField()
  translations?: Translation;
}
