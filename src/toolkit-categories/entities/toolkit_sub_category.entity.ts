import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ToolkitSubCategory {
  description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_category: string;
  ranking: number;
  @HideField()
  translations?: Translation;
}
