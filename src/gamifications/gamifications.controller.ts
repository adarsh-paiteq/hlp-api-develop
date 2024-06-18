import { Controller, Post, Body } from '@nestjs/common';
import { TestCreateGamificationArgs } from './gamifications.model';
import { GamificationsQueue } from './gamifications.queue';
import { GamificationsService } from './gamifications.service';

@Controller('gamifications')
export class GamificationsController {
  constructor(
    private readonly gamificationsService: GamificationsService,
    private readonly gamificationsQueue: GamificationsQueue,
  ) {}

  @Post('/goal')
  async addChallengeTest(
    @Body() addGamificationArgs: TestCreateGamificationArgs,
  ): Promise<unknown> {
    return this.gamificationsService.createGoalGamification(
      addGamificationArgs.user_Id,
      addGamificationArgs.goal_level_id,
    );
  }

  @Post('/membershipLevel')
  async membershipLevelTest(
    @Body() addGamificationArgs: TestCreateGamificationArgs,
  ): Promise<unknown> {
    return this.gamificationsService.createMemberGamification(
      addGamificationArgs.user_Id,
      addGamificationArgs.membership_level_id,
    );
  }

  @Post('/toolkit-streak')
  async toolkitStreakTest(
    @Body() addGamificationArgs: TestCreateGamificationArgs,
  ): Promise<unknown> {
    return this.gamificationsService.createStreakGamification(
      addGamificationArgs.user_Id,
      addGamificationArgs.toolkit_streak_id,
    );
  }

  @Post('/membershipStage')
  async membershipStageTest(
    @Body() addGamificationArgs: TestCreateGamificationArgs,
  ): Promise<unknown> {
    return this.gamificationsService.createMembershipStageGamification(
      addGamificationArgs.user_Id,
      addGamificationArgs.membership_stage_id,
    );
  }

  @Post('/trophy')
  async trophyTest(
    @Body() addGamificationArgs: TestCreateGamificationArgs,
  ): Promise<unknown> {
    return this.gamificationsService.createtrophiesGamification(
      addGamificationArgs.user_Id,
      addGamificationArgs.trophy_id,
    );
  }

  @Post('/test')
  async testQueue(@Body() addGamificationArgs: any): Promise<unknown> {
    return this.gamificationsQueue.checkGamificationMembershipLevel(
      addGamificationArgs,
    );
  }
}
