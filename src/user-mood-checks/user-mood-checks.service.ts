import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import {
  AssUserMoodCheckArgs,
  UserMoodCheckDto,
} from './dto/add-user-mood-check.dto';
import {
  GetUserMoodCheckStreakResponse,
  UserMoodCheckStreak,
} from './dto/user-mood-check-streaks.dto';
import { UserMoodCheck } from './entities/user-mood-check.entity';
import { UserMoodChecksRepo } from './user-mood-check.repo';
import {
  UserMoodCheckSavedEvent,
  UserMoodChecksEvent,
} from './user-mood-checks.event';
import { UserMoodChecksQueue } from './user-mood-checks.queue';

@Injectable()
export class UserMoodChecksService {
  constructor(
    private readonly userMoodChecksRepo: UserMoodChecksRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly userMoodCheckQueue: UserMoodChecksQueue,
  ) {}

  getWeekDays(
    startDate: DateTime,
    moodChecks: UserMoodCheck[],
  ): UserMoodCheckStreak[] {
    const days = [...Array(7).keys()].map((_, index) => {
      const date = startDate.set({ day: startDate.day + index });
      const weekday = date.toFormat('EEE');
      const { day } = date;
      const isCompleted = moodChecks.find((moodCheck) => {
        return DateTime.fromISO(moodCheck.date.toISOString()).hasSame(
          date,
          'day',
        );
      });
      return {
        weekday,
        is_completed: isCompleted !== undefined,
        day,
      };
    });
    return days;
  }

  getStreakDays(weekdays: UserMoodCheckStreak[], currentDay: number): number {
    let dayCount = 0;
    weekdays.forEach((weekday) => {
      if (weekday.is_completed && currentDay >= weekday.day) {
        dayCount += 1;
      }
      if (!weekday.is_completed && weekday.day < currentDay) {
        dayCount = 0;
      }
    });
    return dayCount;
  }

  async getUserMoodCheckStreak(
    userId: string,
    date: string,
  ): Promise<GetUserMoodCheckStreakResponse> {
    const dateTime = DateTime.fromISO(date);
    const startDate = dateTime.startOf('week');
    const endDate = dateTime.endOf('week');
    const moodChecks = await this.userMoodChecksRepo.getMoodChecksByDateRange(
      userId,
      startDate.toISODate() as string,
      endDate.toISODate() as string,
    );
    const weekdays = this.getWeekDays(startDate, moodChecks);
    const streak = this.getStreakDays(weekdays, dateTime.day);
    return {
      streak,
      weekdays,
    };
  }

  async addUserMoodCheck(
    userId: string,
    args: AssUserMoodCheckArgs,
  ): Promise<UserMoodCheck> {
    const moodCheckCategory = await this.userMoodChecksRepo.getMoodCategory(
      args.category_id,
    );
    if (!moodCheckCategory) {
      throw new NotFoundException(`user-mood-checks.`);
    }
    const dateTime = DateTime.fromJSDate(new Date());
    const date = dateTime.toISODate() as string;
    const moodCheck: UserMoodCheckDto = {
      user_id: userId,
      date,
      category_id: moodCheckCategory.id,
      feeling_type: moodCheckCategory.feeling_type,
      sub_category_ids: args.sub_category_ids,
    };
    const newMoodCheck = await this.userMoodChecksRepo.addUserMoodCheck(
      moodCheck,
    );
    this.eventEmitter.emit(
      UserMoodChecksEvent.MOOD_CHECK_SAVED,
      new UserMoodCheckSavedEvent(newMoodCheck),
    );
    await this.userMoodCheckQueue.saveUserMoodCheckStreak(userId, date);
    return newMoodCheck;
  }

  async saveUserMoodCheckStreak(userId: string, date: string): Promise<string> {
    const existingStreak =
      await this.userMoodChecksRepo.getUserMoodCheckStreakByDate(userId, date);
    if (existingStreak) {
      const message = `User mood check streak already saved`;
      return message;
    }
    const { streak } = await this.getUserMoodCheckStreak(userId, date);
    const userMoodCheckStreak =
      await this.userMoodChecksRepo.saveUserMoodCheckStreak(
        userId,
        date,
        streak,
      );
    const message = `${userMoodCheckStreak.date} saved`;
    return message;
  }
}
