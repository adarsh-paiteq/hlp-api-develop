import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@ArgsType()
export class ChangeDoctorPasswordArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  @Field()
  oldPassword: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#^])[A-Za-z0-9@$!%*?&#^]{8,}$/,
    {
      message: i18nValidationMessage('is_matches'),
    },
  )
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  @Field()
  newPassword: string;
}

@ObjectType()
export class ChangeDoctorPasswordResp {
  @Field(() => String)
  message: string;
}
