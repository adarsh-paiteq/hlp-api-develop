import { i18nValidationMessage } from '@core/modules/i18n-next';
import { LeaveGroupArgs } from './leave-group.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RemoveGroupUserResponse {
  @Field(() => String)
  message: string;
}

@ArgsType()
export class RemoveGroupUserArgs extends LeaveGroupArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  userId: string;
}
