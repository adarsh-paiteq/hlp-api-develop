import { Body, Controller, Post } from '@nestjs/common';
import { CheckMembershipLevelDto } from './membership-levels.dto';
import { MembershipLevelsService } from './membership-levels.service';

@Controller('membership-levels')
export class MembershipLevelsController {
  constructor(
    private readonly membershipLevelsService: MembershipLevelsService,
  ) {}

  /**
   * @description The specified Action and Event could not be found. Additionally,it is used for job event.
   */
  @Post('/check')
  async getNextMembershipLevelTest(
    @Body() body: CheckMembershipLevelDto,
  ): Promise<string> {
    return this.membershipLevelsService.checkMembershipLevel(body);
  }
}
