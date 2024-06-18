import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  AddBlogToolKitRewardArgs,
  CommonRespMessage,
  UserRewards,
} from './entities/user-rewards.entity';
import { RewardsService } from './rewards.service';

@Resolver()
export class RewardsResolver {
  constructor(private readonly rewardService: RewardsService) {}

  @Query(() => [UserRewards], { name: 'getUserRewardHistory' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserRewardHistory(
    @GetUser() user: LoggedInUser,
  ): Promise<UserRewards[]> {
    return this.rewardService.getUserRewardHistory(user.id);
  }
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CommonRespMessage, { name: 'addBlogToolKitReward' })
  async addBlogToolKitReward(
    @GetUser() user: LoggedInUser,
    @Args() args: AddBlogToolKitRewardArgs,
  ): Promise<CommonRespMessage> {
    return this.rewardService.addBlogToolKitReward(user.id, args.toolKitId);
  }
}
