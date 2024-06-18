import { UserChannel } from '@channels/entities/user-channel.entity';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UserChannelDto extends UserChannel {
  @IsNotEmpty()
  @IsUUID()
  channel_id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
