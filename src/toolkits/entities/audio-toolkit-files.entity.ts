import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AudioToolKitFile {
  id: string;
  title: string;
  audio_url: string;
  audio_id: string;
  audio_file_path: string;
  tool_kit_id: string;
  created_at: string;
  updated_at: string;
}
