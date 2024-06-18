import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Users } from '../users.model';
import { Trophy } from '../../trophies/entities/trophy.entity';
import { FavouritePost } from '../../channels/entities/favourite-posts.entity';
import { MembershipLevel } from '../../membership-levels/entities/membership-level.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { Challenge } from '../../challenges/challenges.model';
import { Toolkit } from '../../toolkits/toolkits.model';
import { UserChallenge } from '../../challenges/entities/user-challenge.entity';
import { UserPostDetail } from '../../channels/dto/get-post-reactions.dto';

@ObjectType()
export class ChallengeWithToolkits extends UserChallenge {
  @Field(() => Challenge)
  challenges: Challenge;

  @Field(() => Toolkit)
  tool_kits: Toolkit;
}

@ObjectType()
export class UserInfo {
  @Field(() => Users)
  users: Users;

  @Field(() => MembershipLevel, { nullable: true })
  membership_levels: MembershipLevel;

  @Field(() => MembershipStage, { nullable: true })
  membership_stages: MembershipStage;

  @Field(() => [ChallengeWithToolkits], { nullable: true })
  user_challenges: ChallengeWithToolkits[];

  @Field(() => [Trophy], { nullable: true })
  user_trophies: Trophy[];

  @Field(() => Int)
  friend_count: number;

  @Field(() => Int)
  donation_count: number;
}

@ObjectType()
export class FavouritePosts extends FavouritePost {
  @Field(() => UserPostDetail, { nullable: true })
  channel_user_posts: UserPostDetail;
}

@ObjectType()
export class GetProfileInfoResponse {
  @Field(() => UserInfo)
  userInfo: UserInfo;

  @Field(() => [FavouritePosts], { nullable: true })
  favouritePosts: FavouritePosts[];

  @Field(() => [UserPostDetail], { nullable: true })
  userPosts: UserPostDetail[];
}
