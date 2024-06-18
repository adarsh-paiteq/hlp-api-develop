import { Field, ObjectType } from '@nestjs/graphql';
import { MyChannel } from './get-my-channels.dto';
import { UserFeedPost } from './get-user-feed.dto';
import { Channel } from '../entities/channel.entity';

@ObjectType()
export class GetUserChannelsTimelineResponse {
  @Field(() => Boolean)
  hasMore: boolean;
  @Field(() => [MyChannel], { nullable: 'items' })
  channels: MyChannel[];

  @Field(() => [UserFeedPost], { nullable: 'items' })
  posts: UserFeedPost[];

  @Field(() => Channel, { nullable: true })
  default_channel: Channel;
}
