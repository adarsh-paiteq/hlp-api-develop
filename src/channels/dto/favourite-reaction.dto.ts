import { i18nValidationMessage } from '@core/modules/i18n-next';
import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class FavouriteReactionInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reaction_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reaction_creator_id: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  favourite: boolean;
}

export class FavouriteReactionDto {
  post_id: string;
  reaction_id: string;
  reaction_creator_id: string;
  user_id: string;
}
