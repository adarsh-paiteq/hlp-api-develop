import { Field, ObjectType } from '@nestjs/graphql';
import { UserNotificationSettings } from '@users/users.dto';

@ObjectType()
export class DoctorNotificationSettingResponse {
  @Field(() => UserNotificationSettings)
  doctorNotificationSetting: UserNotificationSettings;
}
