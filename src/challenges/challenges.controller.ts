import { Body, Controller, Logger, Param, Patch, Post } from '@nestjs/common';
import {
  GetResultBodyDto,
  GetResultParamDto,
  GetResultResponseDto,
} from './challenges.dto';
import {
  AddChallengeArgs,
  ChallengeResponse,
  UpdateChallengeArgs,
} from './challenges.model';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
export class ChallengesController {
  private readonly logger = new Logger(ChallengesController.name);
  constructor(private readonly challengesService: ChallengesService) {}
  @Post('/:id/result')
  async getResult(
    @Param() param: GetResultParamDto,
    @Body() body: GetResultBodyDto,
  ): Promise<GetResultResponseDto> {
    return this.challengesService.getResult(param.id, body);
  }

  @Post('/add')
  async addChallenge(
    @Body() addChallengeArgs: AddChallengeArgs,
  ): Promise<ChallengeResponse> {
    return this.challengesService.addChallenge(addChallengeArgs);
  }

  /**
   * @deprecated This action is currently utilized within the app and has  been migrated getUserChallengeResult
   */
  @Post('/:id/update')
  async updateChallenge(
    @Body() updateChallengeArgs: UpdateChallengeArgs,
    @Param('id') challengeId: string,
  ): Promise<ChallengeResponse> {
    return this.challengesService.updateChallenge(
      challengeId,
      updateChallengeArgs,
    );
  }

  @Patch('/:id/end')
  async testChallengeEnd(@Param('id') id: string): Promise<string> {
    return this.challengesService.endTheChallenge(id);
  }
}
