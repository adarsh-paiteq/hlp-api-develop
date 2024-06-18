import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { UserMoodCheckDto } from './dto/add-user-mood-check.dto';
import { MoodCheckCategory } from './entities/mood-check-category.entity';
import { UserMoodCheckStreak } from './entities/user-mood-check-streak.entity';
import { UserMoodCheck } from './entities/user-mood-check.entity';

@Injectable()
export class UserMoodChecksRepo {
  constructor(private readonly database: Database) {}

  async getMoodChecksByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<UserMoodCheck[]> {
    const query = `SELECT DISTINCT ON (date) * from user_mood_checks WHERE user_id=$1 AND date BETWEEN $2 AND $3 ORDER BY date`;
    const moodChecks = await this.database.query<UserMoodCheck>(query, [
      userId,
      startDate,
      endDate,
    ]);
    return moodChecks;
  }

  async getMoodCategory(id: string): Promise<MoodCheckCategory> {
    const query = `SELECT * FROM mood_check_categories WHERE id=$1`;
    const [category] = await this.database.query<MoodCheckCategory>(query, [
      id,
    ]);
    return category;
  }

  async addUserMoodCheck(moodCheck: UserMoodCheckDto): Promise<UserMoodCheck> {
    const query = `INSERT INTO user_mood_checks (user_id,category_id,sub_category_ids,feeling_type,date) VALUES($1,$2,$3,$4,$5) RETURNING *`;
    const [userMoodCheck] = await this.database.query<UserMoodCheck>(query, [
      moodCheck.user_id,
      moodCheck.category_id,
      moodCheck.sub_category_ids,
      moodCheck.feeling_type,
      moodCheck.date,
    ]);
    return userMoodCheck;
  }

  async getUserMoodCheckStreakByDate(
    userId: string,
    date: string,
  ): Promise<UserMoodCheckStreak> {
    const query = `SELECT * FROM user_mood_check_streaks WHERE user_id=$1 AND date=$2`;
    const [userMoodCheckStreak] =
      await this.database.query<UserMoodCheckStreak>(query, [userId, date]);

    return userMoodCheckStreak;
  }

  async saveUserMoodCheckStreak(
    userId: string,
    date: string,
    count: number,
  ): Promise<UserMoodCheckStreak> {
    const query = `INSERT INTO user_mood_check_streaks (user_id,date,streak_count) VALUES ($1,$2,$3) RETURNING *`;
    const [userMoodCheckStreak] =
      await this.database.query<UserMoodCheckStreak>(query, [
        userId,
        date,
        count,
      ]);
    return userMoodCheckStreak;
  }
}
