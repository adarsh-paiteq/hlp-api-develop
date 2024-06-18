import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlayedAudioToolkitAudioFile {
  id: string;
  schedule_id: string;
  session_id: string;
  audio_file_id: string;
  consumed_duration: string;
  created_at: Date;
  updated_at: Date;
}
