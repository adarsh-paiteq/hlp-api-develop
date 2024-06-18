import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ExtraInformationType } from '../users.dto';
import { IsEnum, IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';
import { Challenge } from '../../challenges/challenges.model';
import { Channel } from '../../channels/entities/channel.entity';
import { Faq } from '../../faq/entities/faq.entity';
import { ServiceOffer } from '../../service-offers/entities/service-offer.entity';
import { Toolkit } from '../../toolkits/toolkits.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

registerEnumType(ExtraInformationType, { name: 'ExtraInformationType' });

@ArgsType()
export class GetExtraInformationArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @ValidateIf((obj: GetExtraInformationArgs) => {
    return obj.extra_info_type == ExtraInformationType.TOOL_KIT;
  })
  @Field(() => String, { nullable: true })
  id?: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEnum(ExtraInformationType, { message: i18nValidationMessage('is_enum') })
  @Field(() => ExtraInformationType)
  extra_info_type: ExtraInformationType;

  lang: string;
}

@ObjectType()
export class GetExtraInformationResponse {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

export const ExtraInformationTableName = new Map([
  [ExtraInformationType.CHALLENGE, 'challenges'],
  [ExtraInformationType.TOOL_KIT, 'tool_kits'],
  [ExtraInformationType.FAQ, 'faq'],
  [ExtraInformationType.CHANNEL, 'channels'],
  [ExtraInformationType.OFFER_DETAIL, 'service_offers'],
]);

export type EntityExtraInformation =
  | Toolkit
  | Challenge
  | Faq
  | Channel
  | ServiceOffer;
