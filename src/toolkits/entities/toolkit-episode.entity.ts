import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ToolkitEpisode {
  id: string;
  tool_kit_id: string;
  form_id: string;
  created_at: Date;
  updated_at: Date;
}
