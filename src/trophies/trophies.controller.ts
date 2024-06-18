import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { CheckTrophies, Trophy, TrophyTypeDto } from './trophies.dto';
import { TrophiesService } from './trophies.service';

@Controller('trophies')
export class TrophiesController {
  constructor(private readonly trophiesService: TrophiesService) {}

  /**
   * @description The specified Action and Event could not be found. Additionally, it appears that they have not been migrated and are related to the testing controller.
   */
  @Post('/achieved')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTrophiesCchieved(
    @GetUser() user: LoggedInUser,
    @Body() trophy_type: TrophyTypeDto,
  ): Promise<Trophy | undefined> {
    return this.trophiesService.checkIfUserHasAchievedTheTropphy(
      user.id,
      trophy_type.trophy_type,
    );
  }

  /**
   * @description The specified Action and Event could not be found. Additionally, it appears that they have not been migrated and are related to the testing controller.
   */
  @Post('/save-test')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async checkGoalLevel(
    @GetUser() user: LoggedInUser,
    @Body() body: TrophyTypeDto,
  ): Promise<{ response: string }> {
    const data: CheckTrophies = {
      user_id: user.id,
      trophy_type: body.trophy_type,
    };
    return this.trophiesService.checkAndSaveAchievedTrophies(data);
  }
}
