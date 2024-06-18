import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLInt } from 'graphql';
import { Toolkit } from '../../toolkits/toolkits.model';
import { Channel } from '../entities/channel.entity';
import { UserChannel } from '../entities/user-channel.entity';
import { UserFeedPost } from './get-user-feed.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Type } from 'class-transformer';

@ObjectType()
export class ChannelDetailDto extends Channel {
  @Field(() => UserChannel, { nullable: true })
  userChannel?: UserChannel;

  @Field(() => GraphQLInt)
  followers_count: number;

  @Field(() => Boolean)
  is_channel_followed: boolean;
}

@ObjectType()
export class ChannelToolkitDto extends Toolkit {
  @Field()
  channel_tool_id: string;
}

@ObjectType()
export class GetChannelDetailsResponse {
  @Field(() => ChannelDetailDto)
  channel: ChannelDetailDto;

  @Field(() => [UserFeedPost], { nullable: 'items' })
  posts: UserFeedPost[];

  @Field(() => [ChannelToolkitDto], { nullable: 'items' })
  tools: ChannelToolkitDto[];
}

@InputType()
export class ChannelPostFilter {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_own_posts?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_favourite_posts?: boolean;
}

@ArgsType()
export class GetChannelDetailsArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  id: string;
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => ChannelPostFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @Field(() => ChannelPostFilter, { nullable: true })
  filters?: ChannelPostFilter;
}

export class ChannelWithTools extends Channel {
  user_channels: UserChannel[];
  channel_tools: ChannelToolkitDto[];
  followers_count: number;
}

export interface GetChannelPostsParams {
  id: string;
  userId: string;
  date: string;
  page: number;
  limit: number;
  filters?: ChannelPostFilter;
}
