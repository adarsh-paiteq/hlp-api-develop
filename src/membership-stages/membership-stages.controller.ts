import { Body, Controller, Post } from '@nestjs/common';
import {
  GetMembershipStagesSummaryBodyDto,
  GetNextMembershipStageDto,
} from './membership-stages.dto';
import { MembershipStagesService } from './membership-stages.service';

@Controller('membership-stages')
export class MembershipStagesController {
  constructor(
    private readonly membershipStagesService: MembershipStagesService,
  ) {}

  /**
   * @description The specified Action and Event could not be found. Additionally,it is used for job event.
   */
  @Post('/next')
  async getNextMembershipStageTest(
    @Body() body: GetNextMembershipStageDto,
  ): Promise<unknown> {
    return this.membershipStagesService.checkMembershipStage(body);
  }

  /**
   * @description The specified Action and Event could not be found. Additionally, it appears that they have not been migrated and are related to the testing controller.
   */
  @Post('/summary')
  async getMembershipStagesSummary(
    @Body() body: GetMembershipStagesSummaryBodyDto,
  ) {
    return this.membershipStagesService.getMembershipStagesSummary(body.userId);
  }
}
