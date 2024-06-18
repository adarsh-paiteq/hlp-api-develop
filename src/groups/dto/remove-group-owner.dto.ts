import { i18nValidationMessage } from '@core/modules/i18n-next';
import { LeaveGroupArgs } from './leave-group.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RemoveGroupOwnerResponse {
  @Field(() => String)
  message: string;
}

@ArgsType()
export class RemoveGroupOwnerArgs extends LeaveGroupArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  doctorId: string;
}
