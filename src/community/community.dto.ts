import { IsNotEmpty, IsOptional } from 'class-validator';

export interface ChannelInfo {
  is_channel_unfollowed: boolean;
  created_at: Date;
  id: string;
  user_id: string;
  channel_id: string;
  total_followers: number;
  updated_at: Date;
}

export interface UserChannels {
  id: string;
  channel_id: string;
  user_id: string;
  is_channel_unfollowed: boolean;
  created_at: string;
  updated_at: string;
}

export class UserPost {
  id: string;
  user_id: string;
  message: string;
  image_url: string;
  image_id: string;
  file_path: string;
  video_url: string;
}
export class InsertPostVideoInput {
  user_id: string;
  post_id: string;
  video_url: string;
}
export class InsertPostImagesInput {
  user_id: string;
  post_id: string;
  image_url: string;
  image_id: string;
  file_path: string;
}

export enum PayloadType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
export enum OperationTypes {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
export class UpdatePostPayload {
  @IsNotEmpty()
  operation: OperationTypes;
  @IsNotEmpty()
  type: PayloadType;
  @IsOptional()
  images?: { image_url: string; image_id: string; file_path: string }[];
  @IsOptional()
  video?: { video_url: string };
  @IsOptional()
  image_ids?: string[];
  @IsOptional()
  video_id?: string;
}

export interface ChannelPostInfo {
  id: string;
  updated_at: Date;
  created_at: Date;
  user_id: string;
  channel_id: string;
  total_likes: number;
  total_reactions: number;
}

export interface ChannelPostLikeInfo extends ChannelPostInfo {
  post_id: string;
  user_id: string;
  channel_id: string;
  is_reaction_disabled_by_user: boolean;
  is_reaction_disabled_by_admin: boolean;
}

export interface ChannelPostReactionLikeInfo extends ChannelPostLikeInfo {
  reaction_id: string;
  is_conversation_disabled_by_admin: boolean;
  is_conversation_disabled_by_user: boolean;
}

export interface ChannelPostReactionConverationInfo
  extends ChannelPostReactionLikeInfo {
  conversation_id: string;
}
