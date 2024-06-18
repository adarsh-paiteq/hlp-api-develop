import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PlayedAudioToolkitAudioFile } from '../entities/played-audio-toolkit-audio-file.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class SavePlayedAudioToolkitAudioFileInput {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  audio_file_id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  consumed_duration: string;
}

@ObjectType()
export class SavePlayedAudioToolkitAudioFileResponse {
  @Field(() => PlayedAudioToolkitAudioFile)
  played_audio_toolkit_audio_file: PlayedAudioToolkitAudioFile;
}
