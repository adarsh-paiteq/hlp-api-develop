import { Channel } from '@channels/entities/channel.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { IsOptional, IsString } from 'class-validator';
@ArgsType()
export class GetPrivateChannelsArgs extends PaginationArgs {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;
}

@ObjectType()
export class PrivateChannelsData extends PickType(Channel, [
  'id',
  'title',
  'description',
  'image_id',
  'image_url',
  'image_file_path',
]) {}

@ObjectType()
export class GetPrivateChannelsResponse {
  @Field(() => [PrivateChannelsData], { nullable: true })
  channels: PrivateChannelsData[];

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}
