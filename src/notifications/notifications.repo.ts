import { Injectable, Logger } from '@nestjs/common';
import { Users } from '../users/users.model';
import { Database } from '../core/modules/database/database.service';
import { EngagementNotification } from './notifications.model';
import { UserNotificationSettings, UserRoles } from '../users/users.dto';
import { ChannelPostReaction } from '../channels/channels.dto';
import { Challenge, ChallengeResponse } from '../challenges/challenges.model';
import { UserGoal } from '../goals/goals.model';
import { Toolkit } from '../toolkits/toolkits.model';
import { UserNotification } from './entities/user-notifications.entity';
import { UserScheduleSession } from '../schedule-sessions/entities/user-schedule-sessions.entity';
import { Schedule } from '../schedules/schedules.model';
import {
  GetScheduleWithToolKitTitle,
  SaveUserNotificationDto,
  ScheduleWithUser,
  UserNotificationSettingInput,
} from './dto/notifications.dto';
import { Channel } from '../channels/entities/channel.entity';
import { UserNotifications } from './dto/get-notifications.dto';
import { HabitDay } from '../schedules/entities/habit-days.dto';
import { Group } from '../groups/entities/groups.entity';
import { ChatType } from '@chats/entities/chat.entity';
import { TreatmentOption } from '@treatments/entities/treatment-options.entity';
import {
  PaitentInvitationStatus,
  PatientInvitation,
} from '@invitations/entities/patient-invitations.entity';
import {
  ScheduleEntity,
  ScheduleFor,
} from '@schedules/entities/schedule.entity';
import { TreatmentWithTreatmentUsers } from '@emails/emails.dto';
import { Treatment } from '@treatments/entities/treatments.entity';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';

@Injectable()
export class NotificationsRepo {
  private readonly logger = new Logger(NotificationsRepo.name);
  constructor(private readonly database: Database) {}

  async getEngagementNotification(
    date: string,
  ): Promise<EngagementNotification> {
    const query = `SELECT * FROM engagement_notifications WHERE date=$1;`;
    const [data] = await this.database.query<EngagementNotification>(query, [
      date,
    ]);
    return data;
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

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getChallengeById(id: string): Promise<Challenge> {
    const query = `SELECT * FROM challenges where id = $1`;
    const [challenge] = await this.database.query<Challenge>(query, [id]);
    return challenge;
  }

  async getTreatmentPatient(treatmentId: string): Promise<Users> {
    const query = `SELECT
    users.*
  FROM
    treatments
    LEFT JOIN users ON users.id = treatments.user_id
  WHERE
    treatments.id = $1`;
    const [user] = await this.database.query<Users>(query, [treatmentId]);
    return user;
  }

  async getUserByPostId(postId: string): Promise<Users> {
    const query = `SELECT users.* FROM users
    LEFT JOIN channel_user_posts ON $1 = channel_user_posts.id
    WHERE users.id = channel_user_posts.user_id`;
    const [user] = await this.database.query<Users>(query, [postId]);
    return user;
  }

  async getUsersIdsByChallengeId(challengeId: string): Promise<string[]> {
    const query = `SELECT user_id FROM user_challenges
    where challenge_id = $1`;
    const userIds = await this.database.query<{ user_id: string }>(query, [
      challengeId,
    ]);
    const mappedUserIds = userIds.map((user) => user.user_id);
    return mappedUserIds;
  }

  async getPostReactionByPostId(postId: string): Promise<ChannelPostReaction> {
    const query = `SELECT * FROM channel_post_reactions
    WHERE post_id = $1`;
    const [user] = await this.database.query<ChannelPostReaction>(query, [
      postId,
    ]);
    return user;
  }

  async getUserPostByPostId(
    postId: string,
  ): Promise<{ user_id: string; message: string }> {
    const query = `SELECT * FROM channel_user_posts
    WHERE id = $1`;
    const [user] = await this.database.query<{
      user_id: string;
      message: string;
    }>(query, [postId]);
    return user;
  }

  async getChannelById(channelId: string): Promise<Channel> {
    const query = `SELECT * FROM channels where id = $1`;
    const [user] = await this.database.query<Channel>(query, [channelId]);
    return user;
  }

  async getChannelByPostId(postId: string): Promise<Channel> {
    const query = `SELECT channels.* FROM channels
    LEFT JOIN channel_user_posts ON channel_user_posts.id = $1
    WHERE channel_user_posts.channel_id = channels.id`;
    const [user] = await this.database.query<Channel>(query, [postId]);
    return user;
  }

  async getActiveChallengeByToolkit(
    toolkitId: string,
    userId: string,
  ): Promise<ChallengeResponse> {
    const query = `SELECT
    challenges.*,
    CASE
      WHEN challenges.id = user_challenges.challenge_id THEN true
      ELSE false
    END AS is_user_joined_challenge
  FROM
    challenges
    LEFT JOIN user_challenges ON user_challenges.challenge_id = challenges.id
    AND user_challenges.user_id = $3
  WHERE
    tool_kit_id = $1
    AND is_challenge_completed = $2`;
    const [challenge] = await this.database.query<ChallengeResponse>(query, [
      toolkitId,
      'false',
      userId,
    ]);
    return challenge;
  }

  async getUserGoalsByGoalId(
    goalId: string,
    userId: string,
  ): Promise<UserGoal> {
    const query = `SELECT * FROM user_goals WHERE goal = $1 AND user_id = $2`;
    const [userGoal] = await this.database.query<UserGoal>(query, [
      goalId,
      userId,
    ]);
    return userGoal;
  }
  async getUserHabitDayById(
    scheduleId: string,
    toolkitId: string,
  ): Promise<HabitDay> {
    const query = `SELECT
    habit_days.*
  FROM
    habit_days
    LEFT JOIN schedules ON DATE_PART(
      'day',
      CASE
        WHEN CURRENT_DATE ::DATE = schedules.start_date ::DATE THEN INTERVAL '1 day'
        WHEN CURRENT_DATE ::DATE = schedules.end_date ::DATE THEN AGE(
          schedules.end_date ::DATE + INTERVAL '1 day',
          schedules.start_date ::DATE
        )
        ELSE AGE(
          CURRENT_DATE ::DATE + INTERVAL '1 day',
          schedules.start_date ::DATE
        )
      END
    ) = habit_days.day
  WHERE
    habit_days.tool_kit_id = $2
    AND schedules.id = $1; `;
    const [habitDay] = await this.database.query<HabitDay>(query, [
      scheduleId,
      toolkitId,
    ]);
    return habitDay;
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

  async getToolkitById(id: string): Promise<Toolkit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [toolkit] = await this.database.query<Toolkit>(query, [id]);
    return toolkit;
  }

  async saveUserNotifications(
    saveUserNotification: SaveUserNotificationDto,
  ): Promise<UserNotification> {
    const parameters = [...Object.values(saveUserNotification)];
    const query =
      'INSERT INTO user_notifications (' +
      Object.keys(saveUserNotification)
        .map((key) => `${key}`)
        .join(', ') +
      ') VALUES (' +
      Object.values(saveUserNotification)
        .map((value, index) => `$${index + 1}`)
        .join(', ') +
      ') RETURNING *;';
    const [userNotification] = await this.database.query<UserNotification>(
      query,
      parameters,
    );
    return userNotification;
  }

  async getUserScheduleSession(
    scheduleId: string,
    userId: string,
    checkInId: string,
    date: string,
  ): Promise<UserScheduleSession> {
    const query = `SELECT * FROM user_schedule_sessions
    WHERE user_id =$1 AND schedule_id =$2 AND checkin_id=$3
    AND session_date =$4`;
    const [scheduleSession] = await this.database.query<UserScheduleSession>(
      query,
      [userId, scheduleId, checkInId, date],
    );
    return scheduleSession;
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const query = `SELECT * FROM schedules WHERE id=$1`;
    const [schedule] = await this.database.query<Schedule>(query, [id]);
    return schedule;
  }

  async updateUserNotificationSettingById(
    userNotificationId: string,
    userNotificationQuery: UserNotificationSettingInput,
  ): Promise<UserNotificationSettings> {
    const parameters = [
      ...Object.values(userNotificationQuery),
      userNotificationId,
    ];
    const query =
      'UPDATE user_notification_settings SET ' +
      Object.keys(userNotificationQuery)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;
    const [userNotificationSetting] =
      await this.database.query<UserNotificationSettings>(query, [
        ...Object.values(userNotificationQuery),
        userNotificationId,
      ]);

    return userNotificationSetting;
  }

  async readNotificationById(
    userId: string,
    userNotificationId: string,
  ): Promise<UserNotification> {
    const query = `UPDATE user_notifications SET is_read= $1 WHERE id= $2 AND user_id=$3 RETURNING *`;
    const [userNotification] = await this.database.query<UserNotification>(
      query,
      ['true', userNotificationId, userId],
    );
    return userNotification;
  }

  async readAllNotifications(userId: string): Promise<UserNotification[]> {
    const query = `UPDATE user_notifications SET is_read= $1 WHERE user_id=$2 RETURNING *`;
    const userNotifications = await this.database.query<UserNotification>(
      query,
      ['true', userId],
    );
    return userNotifications;
  }

  async getUserNotifications(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ notification: UserNotifications[]; total: number }> {
    const offset = (page - 1) * limit;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total 
    FROM user_notifications
    WHERE user_notifications.user_id=$1 AND user_notifications.is_read=false`;
    const query = `SELECT user_notifications.*,ROW_TO_JSON(users.*) AS account
    FROM user_notifications
    LEFT JOIN users ON users.id=user_notifications.account_id
    where user_notifications.user_id= $1 AND user_notifications.is_read=false
    ORDER BY user_notifications.created_at DESC 
    LIMIT $2 OFFSET $3`;
    const [[{ total }], notification] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [userId]),
      this.database.query<UserNotifications>(query, [userId, limit, offset]),
    ]);
    return { notification, total };
  }

  async getGroupById(id: string): Promise<Group> {
    const query = 'SELECT * FROM channels WHERE id = $1';
    const [group] = await this.database.query<Group>(query, [id]);
    return group;
  }

  async getGroupMembersByChatId(
    chatId: string,
    initiatorUserId: string,
  ): Promise<Users[]> {
    const query = `SELECT users.* FROM chats 
    LEFT JOIN user_channels ON chats.channel_id = user_channels.channel_id
    LEFT JOIN users ON user_channels.user_id =users.id
    WHERE chats.id = $1
    AND chats.chat_type = $2
    AND users.id <> $3 `;
    return await this.database.query<Users>(query, [
      chatId,
      ChatType.CHANNEL,
      initiatorUserId,
    ]);
  }

  async getTreatmentOptionByTreatmentId(
    treatmentId: string,
  ): Promise<TreatmentOption> {
    const query = `select
    treatment_options.*
  from
    treatment_options
    left join treatments on treatments.option_id = treatment_options.id
    where treatments.id=$1`;
    const [treatmentOption] = await this.database.query<TreatmentOption>(
      query,
      [treatmentId],
    );
    return treatmentOption;
  }

  async getPatientInvitation(
    invitation_id: string,
    email: string,
    status: PaitentInvitationStatus,
  ): Promise<PatientInvitation> {
    const query = `SELECT * FROM patient_invitations WHERE id = $1 AND email = $2 AND status = $3 ;`;
    const [patientInvitation] = await this.database.query<PatientInvitation>(
      query,
      [invitation_id, email, status],
    );

    return patientInvitation;
  }

  async getSchedule(scheduleId: string): Promise<ScheduleEntity> {
    const query = `SELECT * FROM schedules WHERE id=$1`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [
      scheduleId,
    ]);
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
    GROUP BY
    users.id, treatment_options.title;
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
        WHERE treatments.id=$1 AND doctor_treatments.is_owner=$2 `;
    const [treatmentOwner] =
      await this.database.query<TreatmentWithTreatmentUsers>(query, [
        trearmentId,
        true,
      ]);
    return treatmentOwner;
  }

  async getScheduleWithToolkit(
    scheduleId: string,
  ): Promise<GetScheduleWithToolKitTitle> {
    const query = `SELECT schedules.*, tool_kits.title AS toolkit_title FROM schedules
    LEFT JOIN tool_kits ON schedules.tool_kit = tool_kits.id
    WHERE schedules.id = $1 AND schedules.schedule_for = $2`;
    const [scheduleWithToolKitTitle] =
      await this.database.query<GetScheduleWithToolKitTitle>(query, [
        scheduleId,
        ScheduleFor.TOOL_KIT,
      ]);
    return scheduleWithToolKitTitle;
  }

  async getScheduleCreator(scheduleId: string): Promise<Users | null> {
    const query = `SELECT users.* FROM schedules
    LEFT JOIN users ON schedules.created_by = users.id
    WHERE schedules.id = $1`;
    const [user] = await this.database.query<Users>(query, [scheduleId]);
    return user;
  }

  async getTreatmentByUserId(userId: string): Promise<Treatment> {
    const query = `SELECT treatments.* 
    FROM treatments WHERE treatments.user_id=$1 AND treatments.is_deleted = $2 ;`;
    const [treatment] = await this.database.query<Treatment>(query, [
      userId,
      false,
    ]);
    return treatment;
  }

  async getScheduleWithUser(scheduleId: string): Promise<ScheduleWithUser> {
    const query = `SELECT 
    schedules.*, 
    ROW_TO_JSON(users.*) AS users, 
    ROW_TO_JSON(doctors.*) AS doctors
    FROM schedules
    LEFT JOIN users ON schedules.user = users.id 
    LEFT JOIN users AS doctors ON schedules.created_by = doctors.id AND doctors.role = $2
    WHERE schedules.id=$1`;
    const [scheduleWithUser] = await this.database.query<ScheduleWithUser>(
      query,
      [scheduleId, UserRoles.DOCTOR],
    );
    return scheduleWithUser;
  }

  async getDoctorTreatment(
    doctorId: string,
    treatmentId: string,
  ): Promise<DoctorTreatment> {
    const query = `SELECT * FROM doctor_treatments WHERE doctor_id=$1 AND treatment_id = $2 AND is_deleted = $3;`;
    const [doctorTreatment] = await this.database.query<DoctorTreatment>(
      query,
      [doctorId, treatmentId, false],
    );
    return doctorTreatment;
  }
}
