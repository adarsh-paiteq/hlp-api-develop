import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { Users } from '@users/users.model';

@ObjectType()
export class UserAccountInformation extends PickType(Users, [
  'id',
  'email',
  'avatar',
  'avatar_image_name',
  'user_name',
  'full_name',
  'puk_reference_id',
]) {}

@ObjectType()
export class GetAccountInformationResponse {
  @Field(() => UserAccountInformation)
  user: UserAccountInformation;

  @Field(() => String, { nullable: true })
  treatment_id?: string;
}
