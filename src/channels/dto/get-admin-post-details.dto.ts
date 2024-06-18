import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PostReactionDetail, UserPostDetail } from './get-post-reactions.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class AdminPostDetailArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  postId: string;
}

@ObjectType()
export class GetAdminPostDetailResponse {
  @Field(() => UserPostDetail)
  posts: UserPostDetail;
  @Field(() => [PostReactionDetail], { nullable: true })
  reactions: PostReactionDetail[];
}
