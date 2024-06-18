import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  InputType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { Users } from '@users/users.model';
import { Organisation } from '@organisations/entities/organisations.entity';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class UpdateFullNameArgs {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  fullName: string;
}
@InputType()
export class UserQueryInput {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  reason: string;
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  query: string;
}

@ArgsType()
export class UserFollowtDto {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  friendId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  follow: boolean;
}

@ArgsType()
export class UpdateAvatarNameArgs {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  avatarImageName: string;
}

export class UpdateUserDto extends PartialType(OmitType(Users, ['id'])) {}

export class UserWithOrganisation extends Users {
  organisation: Organisation;
}

export class UserIdBody {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

export class CommonResponseMessage {
  message: string;
}
