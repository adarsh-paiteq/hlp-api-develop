import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Doctor } from '@doctors/entities/doctors.entity';
import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Users } from '@users/users.model';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { GraphQLInt } from 'graphql';

@ArgsType()
export class GetAppointmentHistoryArgs extends PaginationArgs {
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  date: string;
}
@ObjectType()
export class DoctorData extends PickType(Doctor, [
  'id',
  'user_name',
  'image_id',
  'image_url',
  'file_path',
  'first_name',
  'last_name',
  'email',
]) {}

@ObjectType()
export class UserData extends PickType(Users, [
  'id',
  'full_name',
  'first_name',
  'last_name',
]) {}

@ObjectType()
export class UserAppointmentAnswerHistory {
  @Field(() => DoctorData)
  doctor: DoctorData;

  @Field(() => UserData)
  users: UserData;

  @Field(() => String)
  appointment_type: string;

  @Field(() => GraphQLInt, { nullable: true })
  feeling?: number;

  @Field(() => GraphQLISODateTime)
  session_date: string;

  @Field(() => String)
  session_id: string;

  @Field(() => String)
  user_id: string;

  @Field(() => String)
  schedule_id: string;
}

@ObjectType()
export class GetAppointmentHistoryResponse {
  @Field(() => Number)
  earnedPoints: number;

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;

  @Field(() => [UserAppointmentAnswerHistory], { nullable: true })
  userAppointmentAnswerHistory: UserAppointmentAnswerHistory[];

  @Field(() => [String], { nullable: true })
  calender: string[];
}
