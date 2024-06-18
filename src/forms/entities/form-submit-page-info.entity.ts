import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class FormSubmitPageInfo {
  @Field(() => String)
  id: string;
  emoji: string;
  min_points: number;
  max_points: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  recommended_tool_kit: string;
  form_id: string;
  extra_information_title?: string;
  extra_information_description?: string;
  @HideField()
  translations?: Translation;
}
