import { ArgsType, Field } from '@nestjs/graphql';
import { GetActivityInsightsArgsDto } from './insights.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetUserActivityInsightsArgs extends GetActivityInsightsArgsDto {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}
