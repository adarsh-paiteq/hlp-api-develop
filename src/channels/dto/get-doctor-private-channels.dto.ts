import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import {
  GetPrivateChannelsArgs,
  PrivateChannelsData,
} from './get-private-channels.dto';
@ArgsType()
export class GetDoctorPrivateChannelsArgs extends GetPrivateChannelsArgs {}

@ObjectType()
export class GetDoctorPrivateChannelsResponse {
  @Field(() => [PrivateChannelsData], { nullable: true })
  channels: PrivateChannelsData[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
