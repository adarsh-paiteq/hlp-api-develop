import { Field, ObjectType } from '@nestjs/graphql';
import { UserActions } from '../entity/user-actions.entity';

@ObjectType()
export class ClaimActionResponse {
  @Field(() => UserActions, { nullable: true })
  data: UserActions;
}
