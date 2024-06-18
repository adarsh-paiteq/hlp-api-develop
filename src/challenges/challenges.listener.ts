import { Injectable, Logger } from '@nestjs/common';
import { ChallengesQueue } from './challenges.queue';
import { ChallengesService } from './challenges.service';

@Injectable()
export class ChallengesListener {
  constructor(
    private readonly challengeService: ChallengesService,
    private readonly challengesQueue: ChallengesQueue,
  ) {}
  private readonly logger = new Logger(ChallengesListener.name);
}
