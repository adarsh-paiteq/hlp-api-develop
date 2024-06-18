import { UserChannel } from '@channels/entities/user-channel.entity';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DoctorGroup extends UserChannel {
  is_owner: boolean;
  updated_by: string;
  created_by: string;
}
