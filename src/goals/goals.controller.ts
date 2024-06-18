import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetGoalPointsBody,
  GetGoalPointsParams,
  GetGoalPointsResponse,
} from './dto/get-goal-points.dto';
import {
  GetHistoryQuery,
  GetHistoryResponse,
  GetLevelsResponse,
} from './goals.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  /**
   *@deprecated This method has been deprecated and migrated to getUserGoalLevels
   */
  @Get('/levels')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLevels(@GetUser() user: LoggedInUser): Promise<GetLevelsResponse> {
    return this.goalsService.getLevels(user.id);
  }

  /**
   *@description it indicates that the backend has migrated to the getUserGoalHistory resolver, but the app-side code is still using the getGoalsHistory action.
   */
  @Get('/history')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getGoalHistory(
    @GetUser() user: LoggedInUser,
    @Query() query: GetHistoryQuery,
  ): Promise<GetHistoryResponse> {
    return this.goalsService.getHistory(user.id, query);
  }

  /**
   * @description It is used for testing purposes
   */
  @Post('/checkLevel-test')
  // @Roles(UserRoles.USER)
  // @UseGuards(AuthGuard, RolesGuard)
  async checkGoalLevel(
    @Body() body: { tool_kit_id: string; user_id: string },
  ): Promise<string> {
    return this.goalsService.checkGoalLevel(body.tool_kit_id, body.user_id);
  }

  /**
   * @description It is used for testing purposes
   */
  @Post('/:id/points')
  async getPoints(
    @Param() param: GetGoalPointsParams,
    @Body() body: GetGoalPointsBody,
  ): Promise<GetGoalPointsResponse> {
    return this.goalsService.getGoalPoint(param.id, body.userId);
  }

  /**
   * @description It is used for testing purposes
   */

  @Post('/user-goal')
  async addDefaultUserGoal(
    @Body() payload: GetGoalPointsBody,
  ): Promise<string> {
    return await this.goalsService.addDefaultUserGoal(payload.userId);
  }
}
