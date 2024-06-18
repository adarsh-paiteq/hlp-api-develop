import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { ActionImages } from '../entity/action-images.entity';
import { Action } from '../entity/action.entity';
import { UserActions } from '../entity/user-actions.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class ActionsArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  actionId: string;
}
@ObjectType()
export class GetActionInfoResponse extends Action {
  @Field(() => [ActionImages], { nullable: 'items' })
  action_images: ActionImages[];
  @Field(() => [UserActions], { nullable: 'items' })
  user_actions: UserActions[];
}
