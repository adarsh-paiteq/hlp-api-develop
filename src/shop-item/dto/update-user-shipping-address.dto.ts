import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserAddress } from '@users/entities/user-address.entity';

@InputType()
export class UpdateUserShippingAddressArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  first_name: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  middle_name?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  last_name: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  postal_code: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String)
  house_number: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  house_addition?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  street_address: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String)
  hometown: string;
}

export class SaveUserAddressDTO extends UpdateUserShippingAddressArgs {
  user_id: string;
}

@ObjectType()
export class UpdateUserShippingAddressResponse {
  @Field(() => UserAddress)
  user_shipping_address: UserAddress;
}
