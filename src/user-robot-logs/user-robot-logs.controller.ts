import { Body, Controller, Post } from '@nestjs/common';
import { ClearOnboardingRobotLogBodyDto } from './dto/clear-onborading-robot-log.dto';
import { UserRobotLogsService } from './user-robot-logs.service';

@Controller('user-robot-logs')
export class UserRobotLogsController {
  constructor(private readonly userRobotLogsService: UserRobotLogsService) {}

  @Post('/clear-onboarding')
  async clearOnboardingLogScreen(
    @Body() body: ClearOnboardingRobotLogBodyDto,
  ): Promise<string> {
    return this.userRobotLogsService.clearOnboardingRobotLog(body.userId);
  }
}
