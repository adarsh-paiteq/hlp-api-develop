import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  Field,
  GraphQLISODateTime,
  InputType,
  Int,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import {
  ScheduleWithAnswers,
  UserSchedule,
} from '@schedules/dto/get-dashboard.dto';
import { Toolkit } from '@toolkits/toolkits.model';
import { StageType } from '@treatment-timeline/entities/stage.entity';
import { TreatmentTimelineAttachment } from '@treatment-timeline/entities/treatment-timeline-attachment.entity';
import { TreatmentRoles } from '@treatments/dto/add-treatment.dto';
import { UserRoles } from '@users/users.dto';
import { Users } from '@users/users.model';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

@InputType()
export class TreatementTimelineFilter {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_private_notes?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_session_notes?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_coaches?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_groups?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_tools?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_forms?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_files?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_appointment?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_activity?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_team?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_logs?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_message?: boolean;
}

@InputType()
export class GetTreatmentTimelineInput {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  treatment_id?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => TreatementTimelineFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @Field(() => TreatementTimelineFilter, { nullable: true })
  filters?: TreatementTimelineFilter;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => Int, {
    nullable: true,
    defaultValue: 30,
    description: 'default value is 30',
  })
  limit = 30;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'default value is 1',
  })
  page = 1;
}

export class GetTreatmentTimelineDTO {
  treatmentId?: string;
  userId: string;
  page: number;
  loggedInUserRole: UserRoles;
  limit: number;
  lang: string;
  filters?: TreatementTimelineFilter;
}

@ObjectType()
export class TreatmentTeamMember extends PickType(Users, [
  'id',
  'avatar_image_name',
  'user_name',
  'first_name',
  'last_name',
  'role',
  'avatar_type',
  'file_path',
]) {
  @Field(() => TreatmentRoles, { nullable: true })
  treatment_doctor_role?: TreatmentRoles;
}

@ObjectType()
export class TreatementTimelineMessage {
  @Field(() => String)
  id: string;

  @Field(() => String)
  user_id: string;

  @Field(() => String)
  treatment_id: string;

  @Field(() => StageType)
  stage_type: StageType;

  @Field(() => String)
  message: string;

  @Field(() => TreatmentTeamMember, { nullable: true })
  treatment_team_member?: TreatmentTeamMember;

  @Field(() => TreatmentTimelineAttachment, { nullable: true })
  attachments?: TreatmentTimelineAttachment;

  @Field(() => GraphQLISODateTime)
  created_at: string;

  @Field(() => UserSchedule, { nullable: true })
  agenda?: UserSchedule;

  @Field(() => Toolkit, {
    nullable: true,
    description: `Used in case of stage type ${StageType.DEFAULT} and ${StageType.EXPERIENCE_EXPERT} only`,
  })
  toolkit?: Toolkit;
}

@ObjectType()
export class GetTreatmentTimelineResponse {
  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;

  @Field(() => [TreatementTimelineMessage], { nullable: true })
  treatmentTimelineMessages: TreatementTimelineMessage[];
}

@ObjectType()
export class TreatementTimelineDTO {
  id: string;
  user_id: string;
  treatment_id: string;
  stage_type: StageType;
  message: string;
  treatment_team_member?: TreatmentTeamMember;
  attachments?: TreatmentTimelineAttachment;
  created_at: string;
  schedule_with_answers: ScheduleWithAnswers;
  toolkit: Toolkit;
}
