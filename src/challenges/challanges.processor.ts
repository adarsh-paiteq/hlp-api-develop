import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ChallengesJob, CHALLENGES_QUEUE } from './challenges.queue';
import { ChallengesService } from './challenges.service';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { UserChallenge } from './entities/user-challenge.entity';
@Processor(CHALLENGES_QUEUE)
export class ChallengesProcessor extends ProcessorLogger {
  readonly logger = new Logger(ChallengesProcessor.name);
  constructor(private readonly challengesService: ChallengesService) {
    super();
  }
  @Process({
    name: ChallengesJob.END_THE_CHALLENGE,
    concurrency: defaultWorkersConcurrency,
  })
  async endTheChallenge(
    job: Bull.Job<{
      challengeId: string;
    }>,
  ): Promise<string> {
    try {
      const {
        data: { challengeId },
      } = job;
      return this.challengesService.endTheChallenge(challengeId);
    } catch (error) {
      this.logger.error(`${this.endTheChallenge.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: ChallengesJob.UPDATE_USER_CHALLENGE_STATUS,
    concurrency: defaultWorkersConcurrency,
  })
  async updateUserChallengeStatus(
    job: Bull.Job<{ challengeId: string; userId: string }>,
  ): Promise<UserChallenge> {
    try {
      const {
        data: { challengeId, userId },
      } = job;
      return this.challengesService.updateUserChallengeStatus(
        challengeId,
        userId,
      );
    } catch (error) {
      this.logger.error(
        `${this.updateUserChallengeStatus.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
