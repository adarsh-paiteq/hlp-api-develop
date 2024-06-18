import {
  Field,
  HideField,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { Users } from '@users/users.model';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class UserTreatmentProfileDto extends PickType(Users, [
  'id',
  'user_name',
  'first_name',
  'last_name',
  'date_of_birth',
  'email',
  'gender',
]) {
  @Field(() => String)
  title: string;

  @Field(() => String)
  treatment_id: string;

  @HideField()
  translations?: Translation;
}

@ObjectType()
export class UserTreatmentProfile extends OmitType(UserTreatmentProfileDto, [
  'title',
]) {
  @Field(() => String, { nullable: true })
  treatment_type?: string;
}

@ObjectType()
export class GetUserTreatmentProfileResponse {
  @Field(() => UserTreatmentProfile, { nullable: true })
  userTreatmentProfile?: UserTreatmentProfile;
}
