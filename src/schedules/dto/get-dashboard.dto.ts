import {
  ArgsType,
  Field,
  Int,
  ObjectType,
  PickType,
  createUnionType,
} from '@nestjs/graphql';
import { IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { ScheduleEntity } from '../entities/schedule.entity';
import { GraphQLInt } from 'graphql';
import {
  Toolkit,
  ToolkitAnswers,
  ToolkitType,
} from '../../toolkits/toolkits.model';
import { Unit } from '../schedules.dto';
import { OmitType } from '@nestjs/mapped-types';
import { ScheduleReminder } from '../entities/schedule-reminder.entity';
import { Challenge } from '../../challenges/challenges.model';
import { BlogPost } from '../../blog-posts/blogs-posts.model';
import { Quote } from '../entities/quote.entity';
import { QuoteImage } from '../entities/quote-image.entity';
import { ServiceOffer } from '../../service-offers/entities/service-offer.entity';
import {
  AddictionLogs,
  AnxietySymptomsLogs,
  BloodPressureLogs,
  EmotionSymptomsLogs,
  ForcedActionSymptomsLogs,
  HeartRateLogs,
  HyperActivitySymptomsLogs,
  MedicationLogs,
  MoodLogs,
  SleepLogs,
  StepsLogs,
  SuspiciusSymptomsLogs,
  SymptomsLogs,
  WeightLogs,
} from '../../checkins/dto/checkin-logs.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { MoodCheckCategory } from '../../user-mood-checks/entities/mood-check-category.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { Doctor } from '@doctors/entities/doctors.entity';
import { AgendaFilter } from './get-doctor-calender-agenda.dto';
import { Type } from 'class-transformer';
import { Users } from '@users/users.model';

@ArgsType()
export class GetDashboardArgs extends PaginationArgs {
  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  date: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => AgendaFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @Field(() => AgendaFilter, { nullable: true })
  filters?: AgendaFilter;
}
@ObjectType()
export class AppointmentForms {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => Boolean)
  is_session_form: boolean;
  @Field(() => Boolean)
  is_complaint_form: boolean;
  @Field(() => Int)
  hlp_reward_points: number;
  @Field(() => Boolean)
  is_completed: boolean;
}

@ObjectType()
export class UserAppointmentDetail extends UserAppointment {
  @Field(() => Doctor)
  doctor: Doctor;

  @Field(() => Users)
  users: Users;

  @Field(() => [AppointmentForms], { nullable: true })
  appointment_forms?: AppointmentForms[];
}

@ObjectType()
export class UserSchedule extends ScheduleEntity {
  @Field(() => String, { nullable: true })
  tool_kit_category?: string;

  @Field(() => ToolkitType, { nullable: true })
  tool_kit_type?: ToolkitType;

  @Field(() => String, { nullable: true })
  toolkit_id?: string;

  @Field(() => String, { nullable: true })
  tool_type_text?: string;

  @Field(() => String, { nullable: true })
  tool_description?: string;

  @Field(() => String, { nullable: true })
  image_file_path?: string;

  @Field(() => String, { nullable: true })
  tool_kit_profile_page_file_path?: string;

  @Field(() => String, { nullable: true })
  tool_kit_explain_page_file_path?: string;

  @Field(() => String, { nullable: true })
  toolkit_title?: string;

  @Field(() => GraphQLInt, { nullable: true })
  toolkit_hlp_points?: number;

  @Field(() => String, { nullable: true })
  goal_id?: string | null;

  @Field(() => [UserScheduleEntry], { nullable: 'items' })
  entries: UserScheduleEntry[];

  @Field(() => [ScheduleReminder], { nullable: 'items' })
  schedule_Reminders: ScheduleReminder[];

  @Field(() => GraphQLInt)
  total_sessions: number;

  @Field(() => GraphQLInt)
  completed_sessions: number;

  @Field(() => String, { nullable: true })
  challenge_emoji?: string;

  @Field(() => String, { nullable: true })
  session_id?: string;

  @Field(() => String, { nullable: true })
  last_session_id?: string;

  @Field(() => String, { nullable: true })
  day_id?: string;

  @Field(() => String, { nullable: true })
  habit_id?: string;

  @Field(() => Int, { nullable: true })
  day?: number;

  @Field(() => String, { nullable: true })
  habit_name?: string;

  @Field(() => String, { nullable: true })
  habit_tool_id?: string;

  @Field(() => Int)
  streaks_count: number;

  @Field(() => UserAppointmentDetail, { nullable: true })
  user_appointment?: UserAppointmentDetail;

  @Field(() => [String], { nullable: true })
  form_session_ids?: string[];
}

@ObjectType()
export class GetDashBoardResponse {
  @Field(() => [UserSchedule], { nullable: 'items' })
  agenda: UserSchedule[];

  @Field(() => Boolean)
  has_more: boolean;

  @Field(() => Int)
  user_hlp_points: number;

  @Field(() => Boolean)
  show_robot: boolean;

  @Field(() => [UserDashboardBlog], { nullable: 'items' })
  blogs: UserDashboardBlog[];

  @Field(() => [UserDashboardQuote], { nullable: 'items' })
  quotes: UserDashboardQuote[];

  @Field(() => [UserDashBoardOffers], { nullable: 'items' })
  offers: UserDashBoardOffers[];

  @Field(() => [UserDashboardChallenge], { nullable: 'items' })
  challenges: UserDashboardChallenge[];
  @Field(() => Int)
  unread_chat_count: number;
}

export class ToolkitWithUnit extends OmitType(Toolkit, ['unit']) {
  unit: Unit;
}

@ObjectType()
export class ScheduleWithAnswers extends ScheduleEntity {
  toolkit?: ToolkitWithUnit;
  completed: boolean;
  total_sessions: number;
  completed_sessions: number;
  goal_id: string | null;
  challenge: Challenge | null;
  entries: ToolkitAnswers[] | null;
  session_id?: string;
  last_session_id?: string;
  reminders: ScheduleReminder[];
  mood_check_categories?: MoodCheckCategory[];
  streaks_count: number;
  user_appointment?: UserAppointmentDetail;
}

@ObjectType()
export class UserDashboardBlog extends BlogPost {
  @Field(() => Boolean)
  is_read: boolean;
}

@ObjectType()
export class UserDashboardQuote extends Quote {
  @Field(() => [QuoteImage], { nullable: 'items' })
  images: QuoteImage[];
}

@ObjectType()
export class UserDashboardChallenge extends PickType(Challenge, [
  'id',
  'title',
  'image_url',
  'tool_kit_id',
  'short_description',
  'created_at',
  'file_path',
]) {
  @Field(() => ToolkitType)
  tool_kit_type: ToolkitType;

  @Field(() => String)
  tool_kit_category: string;
}

@ObjectType()
export class UserDashBoardOffers extends ServiceOffer {}

export type UserScheduleEntry =
  | MedicationLogs
  | SleepLogs
  | HeartRateLogs
  | WeightLogs
  | StepsLogs
  | BloodPressureLogs
  | MoodLogs
  | AddictionLogs
  | SymptomsLogs
  | EmotionSymptomsLogs
  | AnxietySymptomsLogs
  | SuspiciusSymptomsLogs
  | ForcedActionSymptomsLogs
  | HyperActivitySymptomsLogs;

export const UserScheduleEntry = createUnionType({
  name: 'DashboardScheduleEntry',
  types: () =>
    [
      SleepLogs,
      HeartRateLogs,
      MedicationLogs,
      WeightLogs,
      StepsLogs,
      BloodPressureLogs,
      MoodLogs,
      AddictionLogs,
      SymptomsLogs,
      EmotionSymptomsLogs,
      AnxietySymptomsLogs,
      SuspiciusSymptomsLogs,
      ForcedActionSymptomsLogs,
      HyperActivitySymptomsLogs,
    ] as const,
  resolveType: (value) => {
    if ('heartRate' in value) {
      return HeartRateLogs;
    }
    if ('sleepTime' in value) {
      return SleepLogs;
    }
    if ('medication' in value) {
      return MedicationLogs;
    }
    if ('weight' in value) {
      return WeightLogs;
    }
    if ('steps' in value) {
      return StepsLogs;
    }
    if ('mood_category_id' in value) {
      return MoodLogs;
    }
    if ('addiction_log_answer' in value) {
      return AddictionLogs;
    }
    if ('symptom_level' in value) {
      return SymptomsLogs;
    }
    if ('emotion_symptom_level' in value) {
      return EmotionSymptomsLogs;
    }
    if ('anxiety_symptom_level' in value) {
      return AnxietySymptomsLogs;
    }
    if ('suspicius_symptom_level' in value) {
      return SuspiciusSymptomsLogs;
    }
    if ('forced_action_symptom_level' in value) {
      return ForcedActionSymptomsLogs;
    }
    if ('hyper_activity_symptom_level' in value) {
      return HyperActivitySymptomsLogs;
    }
    return BloodPressureLogs;
  },
});
