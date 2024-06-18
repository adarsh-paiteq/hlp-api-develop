import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TrophiesAchievedEvent,
  TrophiesEvent,
} from '../trophies/trophies.events';
import {
  ScheduleSessionAddedEvent,
  ScheduleSessionEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { BonusesQueue } from './bonuses.queue';

@Injectable()
export class BonusesListener {
  constructor(private readonly bonusesQueue: BonusesQueue) {}

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleScheduleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { scheduleSession } = payload;
    if (scheduleSession.checkin_id) {
      await this.bonusesQueue.checkCheckinBonus(scheduleSession.user_id);
      return;
    }
    await this.bonusesQueue.checkTookitBonus(scheduleSession.user_id);
  }

  @OnEvent(TrophiesEvent.TROPHIES_ACHIVED)
  async handleTrophyAchievedEvent(
    payload: TrophiesAchievedEvent,
  ): Promise<void> {
    const { userTrophy } = payload;
    await this.bonusesQueue.checkTrophyBonus(userTrophy.user_id);
  }
}
