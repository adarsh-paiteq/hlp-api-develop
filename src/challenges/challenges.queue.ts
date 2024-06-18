import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { defaultJobOptions } from '@core/configs/bull.config';
export const CHALLENGES_QUEUE = 'challenges';

export const challengesQueueConfig: BullModuleOptions = {
  name: CHALLENGES_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum ChallengesJob {
  END_THE_CHALLENGE = '[CHALLENGES] END THE CHALLENGE',
  UPDATE_USER_CHALLENGE_STATUS = '[CHALLENGES] UPDATE USER CHALLENGE STATUS',
}
export const registerChallengesQueue = BullModule.registerQueueAsync(
  challengesQueueConfig,
);

@Injectable()
export class ChallengesQueue {
  private logger = new Logger(ChallengesQueue.name);
  constructor(
    @InjectQueue(CHALLENGES_QUEUE)
    private readonly challengesQueue: Queue,
  ) {}

  async endTheChallenge(challengeId: string, delay: number): Promise<void> {
    const opts = {
      jobId: challengeId,
      delay: delay,
    };
    const job = await this.challengesQueue.add(
      ChallengesJob.END_THE_CHALLENGE,
      { challengeId: challengeId },
      opts,
    );
    this.logger.log(job.opts);
  }

  async removeJobById(challegeId: string): Promise<void> {
    const job = await this.challengesQueue.getJob(challegeId);
    if (job) {
      job.remove();
      this.logger.log(`JobId ${job.id} Removed`);
    }
  }

  async updateUserChallengeStatus(
    challengeId: string,
    userId: string,
  ): Promise<void> {
    await this.challengesQueue.add(ChallengesJob.UPDATE_USER_CHALLENGE_STATUS, {
      challengeId,
      userId,
    });
  }
}
