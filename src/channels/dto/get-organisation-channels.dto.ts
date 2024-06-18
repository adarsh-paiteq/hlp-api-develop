import { Channel } from '@channels/entities/channel.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ObjectType()
export class GetOrganisationChannelsResponse {
  @Field(() => [Channel], { nullable: true })
  channels: Channel[];
}

@ArgsType()
export class GetOrganisationChannelsArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, { nullable: true })
  search?: string;
}
