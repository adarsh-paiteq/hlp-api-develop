import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { Users } from '../users.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class BlockedUserArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userId: string;
}

@ArgsType()
export class BlockUsertDto {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  blockedUserId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  block: boolean;
}

@ObjectType()
export class BlockedUserList extends PickType(Users, [
  'id',
  'user_name',
  'full_name',
  'avatar',
  'avatar_image_name',
]) {}
