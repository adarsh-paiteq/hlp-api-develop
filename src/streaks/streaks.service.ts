import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ToolkitStreak, UserStreak } from './streaks.dto';
import { StreakAddedEvent, StreakEvent } from './streaks.event';
import { StreaksRepo } from './streaks.repo';

@Injectable()
export class StreaksService {
  private logger = new Logger(StreaksService.name);
  constructor(
    private readonly streaksRepo: StreaksRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * @description The @function getNextStreak() function utilizes a service in streak to retrieve the next streak.
   */
  private mapUserStreaksWithToolKitStreaks(
    userStreaks: UserStreak[],
    toolKitStreaks: ToolkitStreak[],
  ) {
    const completedStreakIds = userStreaks.map((streak) => streak.streak_id);
    const streaks = toolKitStreaks.map((streak) => {
      const isCompleted = completedStreakIds.includes(streak.id);
      return {
        ...streak,
        isCompleted,
      };
    });
    return streaks;
  }

  /**
   * @deprecated The @function getUserTookitStreakHistory() function utilizes a service to retrieve the user's toolkit streak history.
   */
  async getUserToolkitStreaksHistory(userId: string, toolKitId: string) {
    const { toolkit_streaks: toolKitStreaks, user_streaks: userStreaks } =
      await this.streaksRepo.getUserAndToolkitStreaks(userId, toolKitId);
    const streaks = this.mapUserStreaksWithToolKitStreaks(
      userStreaks,
      toolKitStreaks,
    );
    return streaks;
  }

  /**
   * @description The @function addUserStreak() function utilizes a service to add a user streak
   */
  async getNextStreak(userId: string, toolKitId: string) {
    const {
      toolkit_streaks: toolKitStreaks,
      user_streaks: userStreaks,
      count: sessions,
    } = await this.streaksRepo.getStreaksAndSessions(userId, toolKitId);
    const streaks = this.mapUserStreaksWithToolKitStreaks(
      userStreaks,
      toolKitStreaks,
    );

    // assume that streak sequence_number and count are in sequence
    const sortedStreaks = streaks.sort(
      (a, b) => a.sequence_number - b.sequence_number,
    );
    const completedStreakCount = streaks
      .filter((streak) => streak.isCompleted)
      .reduce((acc, streak) => acc + streak.streak_count, 0);

    this.logger.log(`current sessions ${sessions}`);
    this.logger.log(streaks);
    // there is chance that we may miss streak
    const currentStreak = sortedStreaks.find(
      (streak) =>
        !streak.isCompleted &&
        streak.streak_count + completedStreakCount === sessions,
    );
    if (!currentStreak) {
      this.logger.log(`No Matched streak count found for ${sessions}`);
      return;
    }
    return currentStreak;
  }

  /**
   * @description The @function addUserStreak() function utilizes a service to add a user streak, and the @event ADD_STREAK is triggered when a new streak is added.
   */
  async addUserStreak(userId: string, toolKitId: string) {
    const streak = await this.getNextStreak(userId, toolKitId);
    if (!streak) {
      return;
    }
    const newStreak: UserStreak = {
      user_id: userId,
      tool_kit_id: toolKitId,
      streak_id: streak.id,
    };
    const savedStreak = await this.streaksRepo.saveStreak(newStreak);
    this.logger.log(
      `${userId} reached the streak ${streak.streak_count} for ${streak.toolKitByToolKit.title}`,
    );
    //event
    this.eventEmitter.emit(
      StreakEvent.STREAK_ADDED,
      new StreakAddedEvent(savedStreak),
    );
    return savedStreak;
  }
}
