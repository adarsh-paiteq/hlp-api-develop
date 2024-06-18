import { Field, ObjectType } from '@nestjs/graphql';
import {} from 'class-validator';
import { GraphQLBoolean } from 'graphql';
import { ChannelUserPost } from '../entities/channel-user-posts.entity';
import { Channel } from '../entities/channel.entity';
@ObjectType()
export class MyChannel {
  @Field(() => Channel)
  channel: Channel;

  @Field(() => ChannelUserPost, { nullable: true })
  latest_post: ChannelUserPost;

  @Field(() => GraphQLBoolean)
  is_viewed: boolean;
}

@ObjectType()
export class GetMyChannelResponse {
  @Field(() => [MyChannel], { nullable: 'items' })
  channels: MyChannel[];
}
