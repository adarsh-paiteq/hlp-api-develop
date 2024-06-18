import {
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
  OmitType,
} from '@nestjs/graphql';
import { Users } from '../../users/users.model';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Doctor extends OmitType(Users, [
  'password',
  'first_name',
  'last_name',
  'organization_id',
  'age_group',
  'avatar',
  'current_membership_level_id',
  'current_membership_stage_id',
  'user_name',
  'hlp_reward_points_balance',
  'is_moderator',
  'is_test_puk',
  'puk_reference_id',
  'full_name',
  'date_of_birth',
  'is_deleted',
  'refresh_token',
  'email_verification_code',
  'gender',
]) {
  password?: string;
  first_name: string;
  last_name: string;
  organization_id: string;
  email: string;
  gender: string; //TODO: chnage type to enum
  user_name?: string;
  @Field(() => GraphQLISODateTime)
  date_of_birth?: string;
  birth_place?: string;
  street?: string;
  land_mark?: string;
  post_code?: string;
  phone_number?: string;
  place?: string;
  mobile_number?: string;
  company_name?: string;
  profession?: string;
  department?: string;
  employee_number?: string;
  image_url?: string;
  image_id?: string;
  file_path?: string;
  is_email_verified: boolean;
  is_onboarded: boolean;
  is_deleted: boolean;
  @HideField()
  access_pin_reset_secret?: string;
  @HideField()
  access_pin_reset_code?: number;
  is_logged_out?: boolean;
  @HideField()
  refresh_token: string | null;
  @HideField()
  email_verification_code: string | null;
  about_me?: string;
  @HideField()
  translations: Translation;
}
