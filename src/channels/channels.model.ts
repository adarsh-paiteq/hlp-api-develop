import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Channel } from './entities/channel.entity';
import { PostImage } from './entities/post-image.entity';
import { PostVideo } from './entities/post-video.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetChannelsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;
}

@ObjectType()
export class GetChannelsResponse {
  channels: Channel[];
  userChannels: Channel[];
  trending: Channel[];
}
@ObjectType()
export class UserPost {
  @Field()
  id: string;
  @Field()
  channel_id: string;
  @Field()
  user_id: string;
  @Field()
  title: string;
  @Field()
  sub_title: string;
  @Field()
  message: string;
  @Field()
  image_url: string;
  @Field()
  image_id: string;
  @Field()
  file_path: string;
  @Field()
  video_url: string;
  @Field()
  total_likes: number;
  @Field()
  total_reactions: number;
  @Field()
  post_time: string;
  @Field()
  post_type: string;
  @Field()
  added_by: string;
  @Field()
  is_post_disabled_by_admin: boolean;
  @Field()
  created_at: string;
  @Field()
  updated_at: string;
}
export enum PayloadType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  MESSAGE = 'MESSAGE',
}
export enum OperationTypes {
  UPDATE_MESSAGE = 'UPDATE_MESSAGE',
  INSERT_IMAGE = 'INSERT_IMAGE',
  INSERT_VIDEO = 'INSERT_VIDEO',
  INSERT_BOTH = 'INSERT_BOTH',
  DELETE = 'DELETE',
  DELETE_IMAGE = 'DELETE_IMAGE',
  DELETE_VIDEO = 'DELETE_VIDEO',
  NO_ACTION = 'NO_ACTION',
}
registerEnumType(OperationTypes, { name: 'OperationTypes' });

@ObjectType()
export class PostUpdateResponse {
  @Field()
  isMsgUpdated: boolean;
  @Field(() => OperationTypes)
  operation: OperationTypes;
  @Field(() => [String])
  ids: string[];
  @Field(() => UserPost)
  post: UserPost;
  @Field(() => [PostImage])
  images: PostImage[];
  @Field(() => [PostVideo])
  videos: PostVideo[];
}

@InputType()
export class PayloadImage {
  @Field()
  @IsString()
  @IsNotEmpty()
  image_url: string;
  @Field()
  @IsString()
  @IsOptional()
  image_id?: string;
  @Field()
  @IsString()
  @IsOptional()
  file_path?: string;
}
@InputType()
export class PayloadVideo {
  @Field()
  @IsString()
  @IsOptional()
  thumb_nail_image_url?: string;
  @Field()
  @IsString()
  @IsOptional()
  thumbnail_image_id?: string;
  @Field()
  @IsString()
  @IsOptional()
  thumbnail_image_id_path?: string;
  @Field()
  @IsString()
  @IsNotEmpty()
  video_url: string;
  @Field()
  @IsString()
  @IsOptional()
  video_id?: string;
  @Field()
  @IsString()
  @IsOptional()
  video_path?: string;
}
@InputType()
export class UpdatePostPayload {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  message?: string;
  @Field(() => [PayloadImage], { nullable: true })
  @Type(() => PayloadImage)
  @ValidateNested({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  images?: PayloadImage[];
  @Field(() => [PayloadVideo], { nullable: true })
  @Type(() => PayloadVideo)
  @ValidateNested()
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  videos?: PayloadVideo[];
  @Field(() => [String], { nullable: true })
  @Type(() => String)
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  image_ids?: string[];
  @Field(() => [String], { nullable: true })
  @Type(() => String)
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  video_ids?: string[];
}
@InputType()
export class SavePostImagesAndVideo {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
  @Field()
  @IsUUID()
  @IsNotEmpty()
  postId: string;
  @Field(() => UpdatePostPayload)
  @Type(() => UpdatePostPayload)
  @ValidateNested()
  @IsNotEmpty()
  payload: UpdatePostPayload;
}
@InputType()
export class UpdatePostImagesAndVideo {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  postId: string;
  @Field(() => UpdatePostPayload)
  @Type(() => UpdatePostPayload)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  payload: UpdatePostPayload;
}

export class ChannelsFollowersCount {
  followers: number;
  channel_id: string;
}
