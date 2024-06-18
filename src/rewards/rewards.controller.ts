import { Body, Controller, Post } from '@nestjs/common';
import {
  AddMembershipLevelRewardDto,
  AddMembershipStageRewardDto,
  AddStreakRewardDto,
  AddToolKitRewardDto,
} from './rewards.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * @deprecated The controller used to add toolkit rewards,it could not be found within the actions and events.
   */
  @Post('/toolKit')
  async addToolKitIdReward(@Body() body: AddToolKitRewardDto): Promise<void> {
    return this.rewardsService.addToolKitReward(body.userId, body.toolKitId);
  }

  /**
   * @deprecated The controller used to add streaks rewards,it could not be found within the actions and events.
   */
  @Post('/streak')
  async addStreakReward(@Body() body: AddStreakRewardDto): Promise<string> {
    return this.rewardsService.addStreakReward(body);
  }

  /**
   * @deprecated The controller used to add stage rewards, it could not be found within the actions and events.
   */
  @Post('/stage')
  async addStageReward(
    @Body() body: AddMembershipStageRewardDto,
  ): Promise<string> {
    return this.rewardsService.addMembershipStageReward(body);
  }

  /**
   * @deprecated The controller used to add level rewards,it could not be found within the actions and events.
   */
  @Post('/level')
  async addLevelReward(
    @Body() body: AddMembershipLevelRewardDto,
  ): Promise<string> {
    return this.rewardsService.addMembershipLevelReward(body);
  }
}
