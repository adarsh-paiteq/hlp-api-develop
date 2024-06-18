import { Field, ObjectType } from '@nestjs/graphql';
import { ExplanationVideos } from '../entities/explanation-videos.entity';
@ObjectType()
export class GetExplanationVideosListResponse {
  @Field(() => [ExplanationVideos], { nullable: true })
  explanationVideos: ExplanationVideos[];
}
