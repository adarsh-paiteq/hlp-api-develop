import { Injectable, NestMiddleware } from '@nestjs/common';

import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SCHEDULES_QUEUE } from '../../schedules/schedules.queue';
import { Request, Response } from 'express';
import { USERS_QUEUE } from '../../users/users.queue';
import { STREAKS_QUEUE } from '../../streaks/streaks.queue';
import { MEMBERSHIP_LEVEL_QUEUE } from '../../membership-levels/membership-levels.queue';
import { MEMBERSHIP_STAGE_QUEUE } from '../../membership-stages/membership-stages.queue';
import { REWARDS_QUEUE } from '../../rewards/rewards.queue';
import { CHANNELS_QUEUE } from '../../channels/channels.queue';
import { TROPHIES_QUEUE } from '../../trophies/trophies.queue';
import { GOALS_QUEUE } from '../../goals/goals.queue';
import { GAMIFICATIONS_QUEUE } from '../../gamifications/gamifications.queue';
import { BONUSES_QUEUE } from '../../bonuses/bonuses.queue';
import { PUK_QUEUE } from '../../puk/puk.queue';
import { USER_SESSION_LOG_QUEUE } from '../../user-session-logs/user-session-log.queue';
import { USER_ROBOT_LOG_QUEUE } from '../../user-robot-logs/user-robot-logs.queue';
import { EMAIL_QUEUE } from '../../emails/emails.queue';
import { NOTIFICATIONS_QUEUE } from '../../notifications/notifications.queue';
import { CHALLENGES_QUEUE } from '../../challenges/challenges.queue';
import { CHECKINS_QUEUE } from '../../checkins/checkins.queue';
import { USER_MOOD_CHECKS_QUEUE } from '../../user-mood-checks/user-mood-checks.queue';
import { CHATS_QUEUE } from '@chats/chats.queue';
import { VIDEO_CALLS_QUEUE } from '@video-calls/video-calls.queue';
import { TREATMENT_TIMELINE_QUEUE } from '@treatment-timeline/treatment-timeline.queue';
import { TREATMENT_TIMELINE_MESSAGE_QUEUE } from '@treatment-timeline/treatment-timeline-message.queue';
import { TREATMENTS_QUEUE } from '@treatments/treatments.queue';

@Injectable()
export class BullBoardMiddleware implements NestMiddleware {
  private queues: Queue[] = [];
  serverAdapter = new ExpressAdapter();
  constructor(
    @InjectQueue(SCHEDULES_QUEUE) private readonly schedulesQueue: Queue,
    @InjectQueue(USERS_QUEUE) private readonly usersQueue: Queue,
    @InjectQueue(STREAKS_QUEUE) private readonly streaksQueue: Queue,
    @InjectQueue(REWARDS_QUEUE) private readonly rewardsQueue: Queue,
    @InjectQueue(MEMBERSHIP_LEVEL_QUEUE)
    private readonly membershipLevelsQueue: Queue,
    @InjectQueue(MEMBERSHIP_STAGE_QUEUE)
    private readonly membershipStagesQueue: Queue,
    @InjectQueue(CHANNELS_QUEUE) private readonly channelQueue: Queue,
    @InjectQueue(TROPHIES_QUEUE) private readonly trophiesQueue: Queue,
    @InjectQueue(GOALS_QUEUE) private readonly goalsQueue: Queue,
    @InjectQueue(GAMIFICATIONS_QUEUE)
    private readonly gamificationsQueue: Queue,
    @InjectQueue(BONUSES_QUEUE) private readonly bonusesQueue: Queue,
    @InjectQueue(PUK_QUEUE) private readonly pukQueue: Queue,
    @InjectQueue(USER_SESSION_LOG_QUEUE)
    private readonly userSessionLogQueue: Queue,
    @InjectQueue(USER_ROBOT_LOG_QUEUE)
    private readonly userRobotLogQueue: Queue,
    @InjectQueue(EMAIL_QUEUE) private readonly emailsQueue: Queue,
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
    @InjectQueue(CHALLENGES_QUEUE)
    private readonly challengesQueue: Queue,
    @InjectQueue(CHECKINS_QUEUE)
    private readonly checkinsQueue: Queue,
    @InjectQueue(USER_MOOD_CHECKS_QUEUE)
    private readonly userMoodChecksQueue: Queue,
    @InjectQueue(CHATS_QUEUE)
    private readonly chatsQueue: Queue,
    @InjectQueue(VIDEO_CALLS_QUEUE)
    private readonly videoCallsQueue: Queue,
    @InjectQueue(TREATMENT_TIMELINE_QUEUE)
    private readonly treatmentTimelineQueue: Queue,
    @InjectQueue(TREATMENT_TIMELINE_MESSAGE_QUEUE)
    private readonly treatmentTimelineMessageQueue: Queue,
    @InjectQueue(TREATMENTS_QUEUE) private readonly treatmentsQueue: Queue,
  ) {
    this.queues = [
      this.schedulesQueue,
      this.usersQueue,
      this.streaksQueue,
      this.rewardsQueue,
      this.membershipLevelsQueue,
      this.membershipStagesQueue,
      this.channelQueue,
      this.trophiesQueue,
      this.goalsQueue,
      this.gamificationsQueue,
      this.bonusesQueue,
      this.pukQueue,
      this.userSessionLogQueue,
      this.userRobotLogQueue,
      this.emailsQueue,
      this.notificationsQueue,
      this.challengesQueue,
      this.checkinsQueue,
      this.userMoodChecksQueue,
      this.chatsQueue,
      this.videoCallsQueue,
      this.treatmentTimelineQueue,
      this.treatmentTimelineMessageQueue,
      this.treatmentsQueue,
    ];
    createBullBoard({
      queues: this.queues.map(
        (queue) => new BullAdapter(queue, { allowRetries: true }),
      ),
      serverAdapter: this.serverAdapter,
    });
    this.serverAdapter.setBasePath('/admin/queue');
  }
  use(req: Request, res: Response): unknown {
    return this.serverAdapter.getRouter()(req, res);
  }
}
