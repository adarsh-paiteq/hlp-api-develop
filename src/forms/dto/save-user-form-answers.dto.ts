import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { UserFormAnswer } from '../entities/user-form-answer.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class SaveUserFormAnswerInput {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  form_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Not required when we save the form that belongs to appointment',
  })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  tool_kit_id?: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  episode_id?: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  challenge_id?: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  day_id?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  note?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  note_image_id?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  note_image_file_path?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  note_image_url?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'episode_session_id is required when using this query for episodes toolkit',
  })
  @ValidateIf(
    (object: SaveUserFormAnswerInput) => object.episode_id !== undefined,
  )
  @IsNotEmpty({ message: 'episode_id_required' })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  episode_session_id?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'appointment_session_id required when we save the form that belongs to appointment',
  })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  appointment_session_id?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'user_appointment_id required when we save the form that belongs to appointment',
  })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  user_appointment_id?: string;
}

export class SaveUserFormAnswerDto extends SaveUserFormAnswerInput {
  user_id: string;
  hlp_points_earned: number;
}

@ObjectType()
export class SaveUserFormAnswerResponse {
  @Field(() => UserFormAnswer)
  userFormAnswer: UserFormAnswer;

  @Field(() => Boolean, {
    description: 'if true then only show the results page otherwise not',
  })
  isResultsPageEnabled: boolean;
}
