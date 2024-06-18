import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateChannelUserFeed {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  channelId: string;
}

export class UpdateChannelUserFeedResponse {
  message: string;
}
