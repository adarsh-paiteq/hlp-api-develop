import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { Schedule } from '../../schedules/schedules.model';
import { GraphQLBoolean } from 'graphql';

import { AudioToolKitFile } from '../entities/audio-toolkit-files.entity';
import { Toolkit } from '../toolkits.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class AudioToolkitFileWithStatus extends AudioToolKitFile {
  @Field(() => GraphQLBoolean)
  is_completed: boolean;
}

@ArgsType()
export class GetAudioToolkitDetailsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, { nullable: true })
  schedule_id: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  toolkit_id: string;
}

@ObjectType()
export class GetAudioToolkitDetailsResponse {
  @Field(() => Toolkit)
  toolkit: Toolkit;

  @Field(() => Schedule, { nullable: true })
  schedule?: Schedule;

  @Field(() => [AudioToolkitFileWithStatus])
  audio_toolkit_files?: AudioToolkitFileWithStatus[];

  @Field(() => String)
  session_id: string;

  @Field(() => GraphQLBoolean)
  is_completed: boolean;
}
