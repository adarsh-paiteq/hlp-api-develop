import { i18nValidationMessage } from '@core/modules/i18n-next';
import { MembershipStage } from '@membership-stages/membership-stages.model';
import {
  ArgsType,
  Field,
  HideField,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { TreatmentComplaint } from '@treatments/entities/treatment-complaints.entity';
import { Users } from '@users/users.model';
import { Translation } from '@utils/utils.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetTreatmentProfileArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  userId: string;
}

@ObjectType()
export class TreatmentProfileDto extends PickType(Users, [
  'first_name',
  'last_name',
  'full_name',
  'user_name',
  'date_of_birth',
  'email',
  'avatar_image_name',
  'gender',
]) {
  @Field(() => Number)
  helped_count: number;
  @Field(() => Number)
  friends_count: number;
  @Field(() => Number, { nullable: true })
  membership_level: number;
  @Field(() => String)
  title: string;
  @HideField()
  translations?: Translation;
  @Field(() => MembershipStage, { nullable: true })
  membership_stage: MembershipStage | null;
  @Field(() => [TreatmentComplaint], { nullable: true })
  treatment_complaints: TreatmentComplaint[];
}

@ObjectType()
export class TreatmentProfile extends OmitType(TreatmentProfileDto, ['title']) {
  @Field(() => String)
  treatment_type: string;
}
@ObjectType()
export class GetTreatmentProfileResponse {
  @Field(() => TreatmentProfile)
  treatmentProfile: TreatmentProfile;
}
