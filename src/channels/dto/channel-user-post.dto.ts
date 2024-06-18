import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  AddedBy,
  ChannelUserPost,
  PostType,
} from '../entities/channel-user-posts.entity';
import { PostImage } from '../entities/post-image.entity';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class ChannelUserPostArgs extends PaginationArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  postId: string;
}

@InputType()
export class SaveUserPostInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channel_id: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => AddedBy, { nullable: true })
  added_by?: AddedBy;

  @Field(() => PostType, { nullable: true })
  post_type?: PostType;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  message: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  image_url?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  image_id?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  file_path?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  video_url?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, { nullable: true })
  sub_title?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, { nullable: true })
  title?: string;
}

export class UserPostData extends SaveUserPostInput {
  user_id?: string;
}
@InputType()
export class UserPostInput extends OmitType(SaveUserPostInput, [
  'channel_id',
  'added_by',
  'post_type',
  'sub_title',
  'title',
]) {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  is_post_disabled_by_user?: boolean;
}

@InputType()
export class UpdateUserPostInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  postId: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Field(() => UserPostInput)
  post: UserPostInput;
}

@InputType()
export class UpdatePostWithImageInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  postId: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Field(() => UserPostInput)
  post: UserPostInput;

  @IsArray()
  @Field(() => [PostImagesInput])
  images: PostImagesInput[];
}

@InputType()
export class PostImagesInput {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_url: string;
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_id?: string;
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  file_path?: string;
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;
}

@ObjectType()
export class PostWithImagesResponse {
  @Field(() => ChannelUserPost)
  userPost: ChannelUserPost;

  @Field(() => [PostImage], { nullable: 'items' })
  postImages: PostImage[];
}

export class PostImageDto extends PostImagesInput {
  user_id: string;
}
