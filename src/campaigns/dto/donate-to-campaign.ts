import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

@ArgsType()
export class DonateToCampaignArgs {
  @IsUUID(undefined, { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  campaign_id: string;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  points: number;
}
