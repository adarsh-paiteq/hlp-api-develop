import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class UserReportedReactionConversationInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reaction_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  conversation_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  reason: string;

  @Field()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information?: string = '';
}

export class ReportedReactionConversation extends UserReportedReactionConversationInput {
  user_id: string;
}
@InputType()
export class UserReportedPostInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  reason: string;

  @Field()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information?: string = '';
}
export class ReportedPost extends UserReportedPostInput {
  user_id: string;
}

@InputType()
export class UserReportedReactionInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reaction_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  reason: string;

  @Field()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information?: string = '';
}
export class ReportedReaction extends UserReportedReactionInput {
  user_id: string;
}

export enum LikeType {
  POST_LIKE = 'POST_LIKE',
  REACTION_LIKE = 'REACTION_LIKE',
  CONVERSATION_LIKE = 'CONVERSATION_LIKE',
}

export const likeTable = new Map<string, string>([
  [LikeType.POST_LIKE, 'channel_post_likes'],
  [LikeType.REACTION_LIKE, 'channel_post_reactions_likes'],
  [LikeType.CONVERSATION_LIKE, 'channel_post_reactions_conversations_likes'],
]);
export const likeUpdateTable = new Map<string, string>([
  [LikeType.POST_LIKE, 'channel_user_posts'],
  [LikeType.REACTION_LIKE, 'channel_post_reactions'],
  [LikeType.CONVERSATION_LIKE, 'channel_post_reactions_conversations'],
]);

export const tableFieldName = new Map<string, string>([
  [LikeType.POST_LIKE, 'post_id'],
  [LikeType.REACTION_LIKE, 'reaction_id'],
  [LikeType.CONVERSATION_LIKE, 'conversation_id'],
]);

export enum ReactionType {
  POST_REACTION = 'POST_REACTION',
  POST_REACTION_CONVERSATION = 'POST_REACTION_CONVERSATION',
}

export const reactionTableName = new Map<ReactionType, string>([
  [ReactionType.POST_REACTION, 'channel_post_reactions'],
  [
    ReactionType.POST_REACTION_CONVERSATION,
    'channel_post_reactions_conversations',
  ],
]);

export const reactionUpdateTableName = new Map<ReactionType, string>([
  [ReactionType.POST_REACTION, 'channel_user_posts'],
  [ReactionType.POST_REACTION_CONVERSATION, 'channel_post_reactions'],
]);

export const reactionTableFieldName = new Map<ReactionType, string>([
  [ReactionType.POST_REACTION, 'post_id'],
  [ReactionType.POST_REACTION_CONVERSATION, 'reaction_id'],
]);

export class UpdateReactionCountDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}
