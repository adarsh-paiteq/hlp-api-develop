import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  AddChallengeArgs,
  ChallengeRankingResponse,
  ChallengeResponse,
  GetRankingArgs,
  IsChallengePointsClaimedArgs,
  IsChallengePointsClaimedResponse,
  UpdateChallengeArgs,
} from './challenges.model';
import { ChallengesService } from './challenges.service';
import {
  GetChallengeInfoArgs,
  GetChallengeInfoResponse,
} from './dto/challenge.dto';
import {
  GetChallengeResultArgs,
  GetChallengeResultResponse,
} from './dto/get-challenge-result.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';

@Resolver()
export class ChallengesResolver {
  constructor(private readonly challengesService: ChallengesService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ChallengeRankingResponse, { name: 'getChallengeRankings' })
  async getRanking(
    @Args() args: GetRankingArgs,
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<ChallengeRankingResponse> {
    return this.challengesService.getRanking(args, user.id, lang);
  }

  @Roles(UserRoles.ADMIN, UserRoles.CONTENT_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChallengeResponse, { name: 'addChallenge' })
  async addChallenge(
    @Args({ name: 'addChallengeArgs' }) addChallengeArgs: AddChallengeArgs,
  ): Promise<ChallengeResponse> {
    return this.challengesService.addChallenge(addChallengeArgs);
  }

  @Roles(UserRoles.ADMIN, UserRoles.CONTENT_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChallengeResponse, { name: 'updateChallenge' })
  async updateChallenge(
    @Args({ name: 'challengeId' }) challengeId: string,
    @Args('updateChallengeArgs')
    updateChallengeArgs: UpdateChallengeArgs,
  ): Promise<ChallengeResponse> {
    return this.challengesService.updateChallenge(
      challengeId,
      updateChallengeArgs,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => IsChallengePointsClaimedResponse, {
    name: 'isChallengePointsClaimed',
  })
  async isChallengePointsClaimed(
    @Args() args: IsChallengePointsClaimedArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<IsChallengePointsClaimedResponse> {
    return this.challengesService.isChallengePointsClaimed(args, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetChallengeInfoResponse, {
    name: 'getChallengeInfo',
  })
  async getChallengeInfo(
    @Args() args: GetChallengeInfoArgs,
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetChallengeInfoResponse> {
    return this.challengesService.getChallengeInfo(
      user.id,
      args.challengeId,
      lang,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetChallengeResultResponse, {
    name: 'getUserChallengeResult',
  })
  async getChallengeResult(
    @Args() args: GetChallengeResultArgs,
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetChallengeResultResponse> {
    return this.challengesService.getUserChallengeResult(user.id, args, lang);
  }
}
