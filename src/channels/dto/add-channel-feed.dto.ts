import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddChannelUserFeed {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsUUID()
  @IsNotEmpty()
  channelId: string;
}

export class AddChannelUserFeedResponse {
  message: string;
}
