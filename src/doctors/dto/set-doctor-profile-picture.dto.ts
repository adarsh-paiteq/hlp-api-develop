import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

@ArgsType()
export class SetDoctorProfilePictureArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  id: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_url: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_id: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  file_path: string;
}
