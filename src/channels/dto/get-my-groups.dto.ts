import { Field, ObjectType } from '@nestjs/graphql';
import { Channel } from '../entities/channel.entity';

@ObjectType()
export class ChannelDto extends Channel {
  @Field()
  has_new_post: boolean;

  @Field(() => String, { nullable: true })
  last_post_created_at?: string;
}

@ObjectType()
export class GetMyGroupsResponse {
  @Field(() => [ChannelDto], { nullable: 'items' })
  channels: ChannelDto[];
}
