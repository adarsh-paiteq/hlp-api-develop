import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class Channel {
  default_channel: boolean;

  @Field(() => Boolean, { nullable: true })
  is_tool_kit_linked?: boolean;

  @Field(() => GraphQLInt)
  total_followers: number;
  description: string;

  @Field(() => String, { nullable: true })
  emoji?: string;

  @Field(() => String, { nullable: true })
  emoji_image_file_path?: string;

  @Field(() => String, { nullable: true })
  emoji_image_id?: string;

  @Field(() => String, { nullable: true })
  emoji_image_url?: string;

  @Field(() => String, { nullable: true })
  extra_information_description?: string;

  @Field(() => String, { nullable: true })
  extra_information_title?: string;

  is_private: boolean;
  image_file_path: string;
  image_id: string;
  image_url: string;
  short_description: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  id: string;
  @HideField()
  translations?: Translation;
}
