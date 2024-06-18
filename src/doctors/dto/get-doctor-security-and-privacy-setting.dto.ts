import { Field, ObjectType } from '@nestjs/graphql';
import { UserSecurityAndPrivacySetting } from '@users/entities/user-security-and-privacy-settings.entity';
@ObjectType()
export class DoctorSecurityAndPrivacySettingResponse {
  @Field(() => UserSecurityAndPrivacySetting)
  doctorSecurityAndPrivacySetting: UserSecurityAndPrivacySetting;
}
