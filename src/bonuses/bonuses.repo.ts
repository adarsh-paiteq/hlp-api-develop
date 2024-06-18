import { Injectable } from '@nestjs/common';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { Database } from '../core/modules/database/database.service';
import { Bonus, BonusType, UserBonus } from './bonuses.dto';

@Injectable()
export class BonusesRepo {
  constructor(private readonly database: Database) {}

  async addUserBonus(bonusId: string, userId: string): Promise<UserBonus> {
    const query = `INSERT INTO user_bonus_claimed (user_id,bonus_id) VALUES($1,$2) RETURNING *; `;
    const [bonus] = await this.database.query<UserBonus>(query, [
      userId,
      bonusId,
    ]);
    return bonus;
  }

  async getUserBonus(bonusId: string, userId: string): Promise<UserBonus[]> {
    const query = `SELECT * FROM user_bonus_claimed WHERE user_id=$1 AND bonus_id=$2  `;
    const bonuses = await this.database.query<UserBonus>(query, [
      userId,
      bonusId,
    ]);
    return bonuses;
  }

  async getUserMembershipStages(
    userId: string,
  ): Promise<UserMembershipStage[]> {
    const query = `SELECT * FROM user_membership_stages WHERE user_id='${userId}'
    `;
    const userMembershipStages = await this.database.query<UserMembershipStage>(
      query,
    );
    return userMembershipStages;
  }

  async getUserScheduleSessionsCount(
    userId: string,
    isCheckin = false,
  ): Promise<number> {
    const filter = isCheckin ? 'IS NOT NULL' : 'IS NULL';
    const query = `SELECT COUNT(user_schedule_sessions.user_id) AS sessions FROM user_schedule_sessions WHERE user_id='${userId}' AND checkin_id ${filter} GROUP BY user_id`;
    const [schedules] = await this.database.query<{
      sessions: number;
    }>(query);
    return schedules ? schedules.sessions : 0;
  }

  async getBonusesWithStatus(
    userId: string,
    bonusType: BonusType,
  ): Promise<Bonus[]> {
    const query = `SELECT *,
    CASE
    WHEN bonuses.id=user_bonus_claimed.bonus_id THEN true ELSE FALSE END AS is_claimed FROM bonuses
    LEFT JOIN user_bonus_claimed ON user_bonus_claimed.bonus_id=bonuses.id AND user_bonus_claimed.user_id='${userId}'
    WHERE bonuses.bonus_type='${bonusType}'
    ORDER BY is_claimed DESC`;
    const bonuses = await this.database.query<Bonus>(query);
    return bonuses;
  }

  async getUserAchievedTriphiesCount(userId: string): Promise<number> {
    const query = `SELECT COUNT(user_trophies.user_id) AS trophies FROM user_trophies WHERE user_id='${userId}' GROUP BY user_id`;
    const [{ trophies }] = await this.database.query<{
      trophies: number;
    }>(query);
    return trophies;
  }

  async getBonusesWithStatusAndTotal(userId: string): Promise<Bonus[]> {
    const query = `SELECT bonuses.*,
    row_to_json(membership_stages.*) as membership_stage,
    CASE
    WHEN user_bonus_claimed.bonus_id=bonuses.id THEN true ELSE false
    END AS is_claimed,
    CASE
    WHEN bonuses.membership_stage_id IN (SELECT membership_stage_id FROM user_membership_stages WHERE user_membership_stages.user_id=$1 ) THEN true ELSE false
    END AS has_membership_stage,
    CASE
    WHEN bonuses.bonus_type='CHECK_IN' THEN (SELECT COUNT(*) FROM user_schedule_sessions WHERE user_schedule_sessions.user_id=$1 AND user_schedule_sessions.checkin_id IS NOT NULL  )
    WHEN bonuses.bonus_type='TOOL_KIT' THEN (SELECT COUNT(*) FROM user_schedule_sessions WHERE user_schedule_sessions.user_id=$1 AND user_schedule_sessions.checkin_id IS NULL  )
    WHEN bonuses.bonus_type='TROPHY' THEN (SELECT COUNT(*) FROM user_trophies WHERE user_trophies.user_id=$1)
    ELSE 0
    END AS total
    FROM bonuses
    LEFT JOIN user_bonus_claimed ON user_bonus_claimed.bonus_id=bonuses.id AND user_bonus_claimed.user_id=$1
    LEFT JOIN membership_stages ON  bonuses.membership_stage_id=membership_stages.id
    ORDER BY is_claimed DESC
    `;
    const bonuses = await this.database.query<Bonus>(query, [userId]);
    return bonuses;
  }
}
