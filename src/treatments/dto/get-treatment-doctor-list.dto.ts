import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { Users } from '@users/users.model';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetAppointmentDoctorListArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  treatmentId: string;
}

@ObjectType()
export class DoctorListData extends PickType(Users, [
  'id',
  'user_name',
  'avatar',
  'avatar_image_name',
  'full_name',
  'first_name',
  'last_name',
]) {}
@ObjectType()
export class GetAppointmentDoctorListResponse {
  @Field(() => [DoctorListData], { nullable: true })
  doctors: DoctorListData[];
}
