import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class UpdateTreatmentArchiveStatusArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  is_archived: boolean;
}

@ObjectType()
export class UpdateTreatmentArchiveStatusResponse {
  @Field(() => String)
  message: string;
}
