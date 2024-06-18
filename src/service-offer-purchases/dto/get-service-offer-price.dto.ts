import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { GraphQLInt } from 'graphql';

@ArgsType()
export class GetServiceOfferPointsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  serviceOfferId: string;
}

@ObjectType()
export class GetServiceOfferPointsResponse {
  @Field(() => GraphQLInt)
  points: number;
}
