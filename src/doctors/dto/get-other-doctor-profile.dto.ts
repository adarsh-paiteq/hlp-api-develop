import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';
import { GetDoctorProfileResponse } from './get-doctor-profile.dto';

@ObjectType()
export class GetOtherDoctorProfileResponse extends GetDoctorProfileResponse {}

@ArgsType()
export class GetOtherDoctorProfileArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  doctorId: string;
}
