import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GamificationResponse,
  UpdateGamificationStatusArgs,
  UpdateGamificationStatusResponse,
} from './gamifications.model';
import { GamificationsService } from './gamifications.service';

@Resolver()
export class GamificationsResolver {
  constructor(private readonly gamificationsService: GamificationsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GamificationResponse)
  async getGamification(
    @GetUser() user: LoggedInUser,
  ): Promise<GamificationResponse> {
    return this.gamificationsService.getGamification(user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateGamificationStatusResponse)
  async updateGamificationStatus(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateGamificationStatusArgs,
  ): Promise<UpdateGamificationStatusResponse> {
    return this.gamificationsService.updateGamificationStatus(args.id, user.id);
  }
}
