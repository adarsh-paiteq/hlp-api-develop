import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { AssUserMoodCheckArgs } from './dto/add-user-mood-check.dto';
import {
  GetUserMoodCheckStreakArgs,
  GetUserMoodCheckStreakResponse,
} from './dto/user-mood-check-streaks.dto';
import { UserMoodCheck } from './entities/user-mood-check.entity';
import { UserMoodChecksService } from './user-mood-checks.service';

@Resolver()
export class UserMoodChecksResolver {
  constructor(private readonly userMoodChecksService: UserMoodChecksService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserMoodCheckStreakResponse, {
    name: 'getUserMoodCheckStreak',
  })
  async getUserMoodCheckStreak(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserMoodCheckStreakArgs,
  ): Promise<GetUserMoodCheckStreakResponse> {
    return this.userMoodChecksService.getUserMoodCheckStreak(
      user.id,
      args.date,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserMoodCheck, {
    name: 'addUserMoodCheck',
  })
  async addUserMoodCheck(
    @GetUser() user: LoggedInUser,
    @Args() args: AssUserMoodCheckArgs,
  ): Promise<UserMoodCheck> {
    return this.userMoodChecksService.addUserMoodCheck(user.id, args);
  }
}
