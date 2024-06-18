import { UserStreak } from './streaks.dto';

export enum StreakEvent {
  STREAK_ADDED = '[STREAK] STREAK ADDED',
  CHECK_STREAK = '[STREAK] CHECK STREAK',
}
export class StreakAddedEvent {
  constructor(public streak: UserStreak) {}
}
export class CheckStreak {
  constructor(public userId: string, public toolKitId: string) {}
}
