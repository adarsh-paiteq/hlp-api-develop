import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';
import { IsUUID } from 'class-validator';

@ArgsType()
export class SaveUserBlogReadArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  blogId: string;
}

@ObjectType()
export class BlogPost {
  day_offer_date: string;
  show_order?: number;
  age_group?: string;
  avatar: string;
  blog_author: string;
  blog_link: string;
  blog_type: string;
  description: string;
  file_path: string;
  image_id: string;
  image_url: string;
  short_description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit?: string;
}

@ObjectType()
export class UserBlogRead {
  id: string;
  blog_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title?: string;
  @HideField()
  translations?: Translation;
}
