import { DoctorProfileVideo } from '@doctors/entities/doctor-profile-videos.entity';
import { Doctor } from '@doctors/entities/doctors.entity';
import { Speciality } from '@doctors/entities/specialities.entity';
import {
  Field,
  HideField,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { UserStatus } from '@users/entities/user-status-info.entity';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class DoctorProfileDto extends PickType(Doctor, [
  'first_name',
  'last_name',
  'about_me',
  'gender',
  'file_path',
  'image_id',
  'image_url',
]) {
  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => String)
  name: string;

  @HideField()
  translations?: Translation;

  @Field(() => [DoctorProfileVideo], { nullable: true })
  profile_videos: DoctorProfileVideo[];

  @Field(() => [Speciality], { nullable: true })
  specialities: Speciality[];
}

@ObjectType()
export class DoctorProfile extends OmitType(DoctorProfileDto, ['name']) {
  @Field(() => String)
  organisation_name: string;
}
@ObjectType()
export class GetDoctorProfileResponse {
  @Field(() => DoctorProfile)
  doctorProfile: DoctorProfile;
}
