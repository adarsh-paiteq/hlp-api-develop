import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EpisodeToolkitVideo {
  created_at: Date;
  updated_at: Date;
  id: string;
  tool_kit_id: string;
  video_toolkit_id: string;
}
