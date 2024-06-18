import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { EpisodeType, Toolkit, VideoToolkitAnswers } from '../toolkits.model';
import { Schedule } from '../../schedules/schedules.model';
import { Form } from '../../forms/entities/form.entity';
import { GraphQLBoolean } from 'graphql';
import { ObjectValue } from '../../utils/utils.dto';
import { UserFormAnswer } from '../../forms/entities/user-form-answer.entity';
import { OmitType } from '@nestjs/mapped-types';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class EpisodeFormWithStatus extends Form {
  @Field(() => String)
  episode_id: string;

  @Field(() => String)
  tool_kit_id: string;

  @Field(() => GraphQLBoolean)
  is_completed: boolean;

  @Field(() => String)
  session_id: string;
}

@ObjectType()
export class EpisodeVideoWithStatus extends Toolkit {
  @Field(() => String)
  episode_id: string;

  @Field(() => Int)
  hlp_reward_points: number;

  @Field(() => String)
  tool_kit_id: string;

  @Field(() => GraphQLBoolean)
  is_completed: boolean;

  @Field(() => String)
  session_id: string;
}

@ArgsType()
export class GetEpisodeToolkitDetailsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, { nullable: true })
  schedule_id: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  toolkit_id: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  episode_session_id?: string;
}

@ObjectType()
export class EpisodeTool {
  @Field()
  id: string;
  @Field()
  description: string;

  @Field(() => Int)
  hlp_reward_points: number;

  @Field()
  title: string;

  @Field()
  tool_kit_id: string;

  @Field()
  episode_id: string;

  @Field()
  is_completed: boolean;

  @Field(() => EpisodeType)
  episode_type: EpisodeType;

  @Field({ nullable: true })
  session_id?: string;
}

@ObjectType()
export class GetEpisodeToolkitDetailsResponse {
  @Field(() => Toolkit)
  toolkit: Toolkit;

  @Field(() => Schedule, { nullable: true })
  schedule?: Schedule;

  @Field(() => [EpisodeTool])
  episode_tools?: EpisodeTool[];

  @Field(() => String)
  episode_session_id: string;

  @Field(() => GraphQLBoolean)
  is_completed: boolean;
}

export const EPISODE_TOOLS_TABLE_NAME = {
  [EpisodeType.FORMS]: 'tool_kits_episodes',
  [EpisodeType.VIDEOS]: 'episode_toolkit_videos',
} as const;

export const EPISODE_TOOLS_ANSWER_TABLE = {
  [EpisodeType.FORMS]: 'user_form_answers',
  [EpisodeType.VIDEOS]: 'video_tool_kit_answers',
} as const;

export type EpisodeToolAnswerTable = ObjectValue<
  typeof EPISODE_TOOLS_ANSWER_TABLE
>;

export type EpisodeToolTableName = ObjectValue<typeof EPISODE_TOOLS_TABLE_NAME>;

export type EpisodeToolAnswer = VideoToolkitAnswers | UserFormAnswer;

export class ExpisodeToolkit extends OmitType(Toolkit, ['episode_type']) {
  episode_type: EpisodeType;
}
