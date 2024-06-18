import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { BonusesService } from './bonuses.service';
import { ClaimBonusArgs } from './dto/claim-bonus.dto';
import { UserBonusClaimed } from './entities/user-bonus.entity';
import { GetBonusesResponse } from './dto/get-bonus.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';

@Resolver()
export class BonusesResolver {
  constructor(private readonly bonusesService: BonusesService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserBonusClaimed, { name: 'userClaimBonus' })
  async claimBonus(
    @GetUser() user: LoggedInUser,
    @Args() args: ClaimBonusArgs,
  ): Promise<UserBonusClaimed> {
    return this.bonusesService.claimBonusNew(args.bonusId, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetBonusesResponse, { name: 'getUserBonuses' })
  async getBonuses(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetBonusesResponse> {
    return this.bonusesService.getBonusesNew(user.id, lang);
  }
}
