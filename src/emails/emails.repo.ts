import { Injectable } from '@nestjs/common';
import { Users } from '../users/users.model';
import { Database } from '../core/modules/database/database.service';
import {
  TreatmentWithTreatmentUsers,
  IntroductionVideoData,
} from './emails.dto';
import { Toolkit } from '../toolkits/toolkits.model';
import { UserNotificationSettings } from '../users/users.dto';
import { Trophy } from '../trophies/entities/trophy.entity';
import { UserAddress } from '../users/entities/user-address.entity';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { OauthUser } from '@oauth/entities/oauth-users.entity';
import { StageMessages } from '@treatment-timeline/entities/stage-messages.entity';
import { ShopItem } from '../shop-item/entities/shop-item.entity';
import { Group } from '@groups/entities/groups.entity';
import { Treatment } from '@treatments/entities/treatments.entity';

@Injectable()
export class EmailsRepo {
  constructor(private readonly database: Database) {}

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getIntroductionVideoEmailData(
    tableName: string,
    language: string,
  ): Promise<IntroductionVideoData> {
    const query = `SELECT *,
    CASE
    WHEN ${tableName}.translations->> '${language}' IS NOT NULL
    THEN (${tableName}.translations->>'${language}'  )::json->>'title'
    ELSE ${tableName}.title
    END AS title,
    CASE
    WHEN ${tableName}.translations->>'${language}' IS NOT NULL
    THEN (${tableName}.translations->> '${language}'  )::json->>'description'
    ELSE ${tableName}.description
    END AS description 
     FROM ${tableName}
          ORDER BY ${tableName}.created_at DESC`;
    const [emailData] = await this.database.query<IntroductionVideoData>(query);
    return emailData;
  }

  async getToolkitsCount(): Promise<number> {
    const query = `SELECT COUNT(tool_kits.id) AS count FROM tool_kits`;
    const [response] = await this.database.query<{ count: number }>(query);
    let count = 50;
    if (response.count > 50) {
      count = Math.floor(response.count / 50) * 50;
    }
    return count;
  }

  async getChannelsCount(): Promise<number> {
    const query = `SELECT COUNT(*) AS count FROM channels`;
    const [response] = await this.database.query<{ count: number }>(query);
    return response.count;
  }

  async getToolOfTheDay(): Promise<Toolkit> {
    const query = `SELECT tool_kits.* FROM blog_posts
    LEFT JOIN tool_kits ON blog_posts.tool_kit = tool_kits.id
    WHERE blog_type='TOOL_KIT'
    ORDER BY blog_posts.created_at DESC LIMIT 1`;
    const [toolkit] = await this.database.query<Toolkit>(query);
    return toolkit;
  }

  async getShopItemById(shopItemId: string): Promise<ShopItem> {
    const query = `SELECT * FROM shop_items where id = $1`;
    const [shopItem] = await this.database.query<ShopItem>(query, [shopItemId]);
    return shopItem;
  }

  async getUserNotificationSettings(
    userId: string,
  ): Promise<UserNotificationSettings> {
    const query = `SELECT * FROM user_notification_settings WHERE user_id = $1`;
    const [notification] = await this.database.query<UserNotificationSettings>(
      query,
      [userId],
    );
    return notification;
  }

  async getUserAchivedTrophy(
    userTrophyId: string,
    language: string,
  ): Promise<Trophy> {
    const query = `SELECT trophies.id,
    trophies.image_url,
    CASE
    WHEN trophies.translations->> $2 IS NOT NULL
    THEN (trophies.translations->> $2 )::json->>'title'
    ELSE trophies.title
    END AS title FROM user_trophies
    LEFT JOIN trophies ON trophies.id = user_trophies.trophy_id
    WHERE user_trophies.id= $1`;
    const [trophy] = await this.database.query<Trophy>(query, [
      userTrophyId,
      language,
    ]);
    return trophy;
  }

  async getUserAddressById(addressId: string): Promise<UserAddress> {
    const query = `SELECT * FROM user_addresses where id = $1`;
    const [userAddress] = await this.database.query<UserAddress>(query, [
      addressId,
    ]);
    return userAddress;
  }

  async getScheduleById(id: string): Promise<ScheduleEntity> {
    const query = `SELECT * FROM schedules WHERE id=$1`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [id]);
    return schedule;
  }

  async getTreatmentWithTreatmentUsers(
    treatmentId: string,
  ): Promise<TreatmentWithTreatmentUsers[]> {
    const query = `SELECT
    users.id,
    users.email,
    users.user_name,
    users.role,
    users.first_name,
    users.last_name,
    users.language,
    users.full_name,
    treatment_options.title AS treatment_name
  FROM
    treatments
    LEFT JOIN
    treatment_options ON treatment_options.id = treatments.option_id
  LEFT JOIN
    treatment_buddies ON treatment_buddies.treatment_id = treatments.id
  LEFT JOIN
    doctor_treatments ON doctor_treatments.treatment_id = treatments.id
  LEFT JOIN
    users ON users.id = treatment_buddies.user_id
         OR users.id = doctor_treatments.doctor_id
         OR users.id = treatments.user_id
  WHERE
    treatments.id = $1
    GROUP BY users.id,treatment_options.title
  `;
    const treatmentWithTreatmentUsers =
      await this.database.query<TreatmentWithTreatmentUsers>(query, [
        treatmentId,
      ]);
    return treatmentWithTreatmentUsers;
  }

  async getTreatmentOwnerByTreatmentId(
    trearmentId: string,
  ): Promise<TreatmentWithTreatmentUsers> {
    const query = `SELECT users.id,users.user_name,users.role,users.first_name,users.last_name,users.email,treatment_options.title AS treatment_name FROM treatments
    LEFT JOIN treatment_options ON treatments.option_id = treatment_options.id
        LEFT JOIN doctor_treatments ON doctor_treatments.treatment_id=treatments.id
        LEFT JOIN users On users.id=doctor_treatments.doctor_id
        WHERE treatments.id=$1 AND treatments.has_participated_in_start_program=$2 AND doctor_treatments.is_owner=$2 `;
    const [treatmentOwner] =
      await this.database.query<TreatmentWithTreatmentUsers>(query, [
        trearmentId,
        true,
      ]);
    return treatmentOwner;
  }

  async getOauthUserById(id: string): Promise<OauthUser> {
    const query = `SELECT * FROM oauth_users WHERE id=$1`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [id]);
    return oauthUser;
  }

  async getToolkitByScheduleId(
    lang: string,
    scheduleId: string,
  ): Promise<Toolkit> {
    const query = `
    SELECT
    tool_kits.id,
    tool_kits.tool_kit_type,
    tool_kits.tool_kit_category,
    tool_kits.goal_id,
   CASE
                WHEN tool_kits.translations->> $1 IS NOT NULL
                THEN (tool_kits.translations->> $1 )::json->>'title'
                ELSE tool_kits.title
                END AS title
  FROM
    schedules
    LEFT JOIN tool_kits ON tool_kits.id = schedules.tool_kit
  WHERE
    schedules.id = $2
    `;
    const [toolkit] = await this.database.query<Toolkit>(query, [
      lang,
      scheduleId,
    ]);
    return toolkit;
  }

  async getStageMessageById(
    stageMessageId: string,
    language: string,
  ): Promise<StageMessages> {
    const query = `SELECT stage_messages.id,
    CASE
        WHEN stage_messages.translations->>$2 IS NOT NULL THEN 
            (stage_messages.translations->>$2)::json->>'message'
        ELSE 
            stage_messages.translations::text
    END AS translations
FROM 
stage_messages
WHERE 
stage_messages.id = $1`;
    const [stageMessage] = await this.database.query<StageMessages>(query, [
      stageMessageId,
      language,
    ]);
    return stageMessage;
  }

  async getUserByEmail(email: string): Promise<Users> {
    const query = `SELECT * FROM users where email ILIKE $1`;
    const [user] = await this.database.query<Users>(query, [email]);
    return user;
  }

  async getSessionDateByScheduleId(
    scheduleId: string,
    userId: string,
  ): Promise<{ session_date: string }> {
    const query = `SELECT user_schedule_sessions.session_date FROM user_schedule_sessions
          WHERE user_schedule_sessions.schedule_id = $1 AND user_schedule_sessions.user_id = $2
          ORDER BY user_schedule_sessions.created_at DESC`;
    const [userSession] = await this.database.query<{ session_date: string }>(
      query,
      [scheduleId, userId],
    );
    return userSession;
  }
  async getGroupById(id: string): Promise<Group> {
    const query = 'SELECT * FROM channels WHERE id = $1';
    const [group] = await this.database.query<Group>(query, [id]);
    return group;
  }

  async getTreatmentById(id: string): Promise<Treatment> {
    const query = 'SELECT * FROM treatments WHERE id = $1';
    const [treatment] = await this.database.query<Treatment>(query, [id]);
    return treatment;
  }
}
