import { Controller, Get, Post, Query } from '@nestjs/common';
import {
  addUserStreak,
  GetUserTookitStreakHistoryTestQuery,
} from './streaks.dto';
import { StreaksService } from './streaks.service';

@Controller('streaks')
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  /**
   * @deprecated Unable to locate the specified Action and Event; it has not been migrated.
   */
  @Get('/history')
  async getUserTookitStreakHistory(
    @Query() query: GetUserTookitStreakHistoryTestQuery,
  ) {
    return this.streaksService.getUserToolkitStreaksHistory(
      query.userId,
      query.toolKitId,
    );
  }

  /**
   * @deprecated Unable to locate the specified Action and Event; it has not been migrated.
   */
  @Post('/')
  async addUserStreak(@Query() query: addUserStreak) {
    return this.streaksService.addUserStreak(query.userId, query.toolKitId);
  }
}
