import { Injectable, Logger } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import {
  AdminSignupDto,
  BuyReminderToneDTO,
  CampaignListResponse,
  GetShopItemByIdAndUserMembershipStagesResponse,
  HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT,
  ReminderTone,
  ShopitemPurchase,
  ToolKitHistoryDTO,
  ToolKitHistoryResponse,
  ToolKitTypes,
  ToolKitTypesAnswerTables,
  UserDonation,
  UserFriends,
  UserFriendsBody,
  UserReminderTone,
  UserScheduleDTO,
  UserSignupDto,
  UserUpdateDto,
  UserNotificationSettings,
  ToolKitAnswerHistoryDTO,
  FragmentsAndFieldNameDto,
  ToolKitTypesAnswerTablesDto,
  CampaignInfo,
  updateScreeNameResponseDto,
  UserChallengesResponseDto,
  UserRoles,
} from './users.dto';
import { StreaksService } from '../streaks/streaks.service';
import { ToolkitStreak } from '../streaks/streaks.dto';
import { toolkitFragment } from '../schedules/schedules.repo';
import { UserReward } from '../rewards/rewards.dto';
import { rewardFragment } from '../rewards/rewards.repo';
import { userMembershipStageFragment } from '../membership-stages/membership-stages.repo';
import { ToolkitService } from '../toolkits/toolkit.service';
import { Database } from '../core/modules/database/database.service';
import {
  Friend,
  HelpedUser,
  LoginOnboarding,
  Onboarding,
  OnboardingScreen,
  Users,
  UserSecurityAndPrivacySettings,
} from './users.model';
import { ServiceOfferPurchase } from '../service-offer-purchases/entities/service-offer-purchase.entity';
import { BlockedUsers } from './entities/blocked-users.entity';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { ShopItemPrice } from './entities/shop-item-price.entity';
import { ShopItem } from './entities/shop-item.entity';
import { ExtraInformation } from './entities/extrainformation.entity';
import {
  UpdateUserDto,
  UserQueryInput,
  UserWithOrganisation,
} from './dto/users.dto';
import { UserQuery } from './entities/user-queries.entity';
import { AboutUs } from './entities/about-us.entity';
import { TermAndCondition } from './entities/terms-and-conditions.entity';
import { UserSecurityAndPrivacySetting } from './entities/user-security-and-privacy-settings.entity';
import { UserFriend } from './entities/user-friend.entity';
import { BlockedUserList } from './dto/blocked-user.dto';
import { SafeGuarding } from './entities/safeguarding.entity';
import { Advocacy } from './entities/advocacy.entity';
import {
  SupportVideoCategory,
  SupportVideosDetail,
} from './dto/get-support-video.dto';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { ReminderTone as ReminderToneNew } from '../purchased-reminder-tones/entities/reminder-tone.entity';
import { UserSecurityAndPrivacySettingInput } from './dto/user-security-privacy-setting.dto';
import { Toolkit } from '../toolkits/toolkits.model';
import { DateTime } from 'luxon';
import {
  EntityExtraInformation,
  ExtraInformationTableName,
  GetExtraInformationArgs,
} from './dto/get-extra-information.dto';
import { FavouritePosts, UserInfo } from './dto/get-user-profile.dto';
import { UserPostDetail } from '../channels/dto/get-post-reactions.dto';
import { RegisterUserInput } from './dto/register-user.dto';
import { Organisation } from '../organisations/entities/organisations.entity';
import {
  ShopitemPurchaseDto,
  UpdateShopitemPurchase,
  UserAddressDto,
} from './dto/purchase-shop-item.dto';
import { UserAddress } from './entities/user-address.entity';
import { GetMyToolsArgs } from './dto/get-my-tools.dto';
import { UserFriendRequest } from './entities/user-friend-request.entity';
import { InsertUserFriendRequest } from './dto/send-friend-request.dto';
import { UserNotification } from '../notifications/entities/user-notifications.entity';
import { FriendRequestsWithUser } from './dto/user-friend-request-list.dto';
import { UsersService } from './users.service';
import { UserFriendData } from './dto/get-user-friends.dto';
import { ChannelInvitationStatus } from '@groups/entities/channel-invitations.entity';
import { UserStatusInfo } from './entities/user-status-info.entity';
import { AddUserStatusInfo } from './dto/add-user-status-info.dto';
import {
  PaitentInvitationStatus,
  PatientInvitation,
} from 'src/invitations/entities/patient-invitations.entity';
import { UserTreatmentProfileDto } from '@treatments/dto/get-treatment-profile.dto';
import {
  OauthUser,
  UserRegistrationStatus,
} from '@oauth/entities/oauth-users.entity';

export interface BlackListedUserName {
  user_name: string;
  id: string;
}
export interface OnboardingsByPk {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/**
 * @deprecated This Repo used in @function getUserByIdQuery()
 */
export const userFragment = gql`
  fragment user on users {
    id
    user_name
    full_name
    password
    role
    refresh_token
    puk_reference_id
    age_group
    avatar
    updated_at
    created_at
    forgot_password_token
    forgot_pin_token
    email_verification_token
    email
    app_access_pin
    hlp_reward_points_balance
  }
`;

/**
 * @deprecated This Repo used in PurchaseReminderTone action , which is not used from app side(in app side they are using purchaseReminderTone resolver name)
 */
const userReminderTonePurchaseFragment = gql`
  fragment user_reminder_tone_purchase on user_reminder_tone_purchases {
    id
    user_id
    reminder_tone_id
    created_at
    updated_at
  }
`;

/**
 * @deprecated Unused Code
 */
const shopItemFragment = gql`
  fragment shop_item on shop_items {
    id
    title
    sub_title
    short_description
    description
    image_url
    image_id
    file_path
    shop_category_id
    link_url
    created_at
    updated_at
    item_price
    hlp_points_required_to_buy_item
  }
`;

/**
 * @deprecated Unused Code
 */
const shopItemPriceFragment = gql`
  fragment shop_item_price on shop_item_prices {
    hlp_reward_points_required
    item_price
    created_at
    updated_at
    id
    membership_stage_id
    shop_item_id
  }
`;
@Injectable()
export class UsersRepo {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly client: HasuraService,
    private streakService: StreaksService,
    private readonly toolkitService: ToolkitService,
    private readonly database: Database,
  ) {}

  /**
   * @deprecated Unused Code
   */
  private readonly userFragment = gql`
    fragment user on users {
      id
      user_name
      full_name
      password
      role
      refresh_token
      puk_reference_id
      age_group
      avatar
      updated_at
      created_at
      forgot_password_token
      forgot_pin_token
      email_verification_token
      email
      app_access_pin
      hlp_reward_points_balance
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly alcohol_tool_kit_fragment = gql`
    fragment alcohol_tool_answer on alcohol_intake_tool_kit_answers {
      id
      user_id
      tool_kit_id
      doses
      feeling
      note
      created_at
      session_date
      alchohol_type {
        id
        title
        emoji
      }
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly meditation_tool_kit_fragment = gql`
    fragment meditation_tool_answer on meditation_tool_kit_answers {
      id
      user_id
      tool_kit_id
      meditation_time
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly medication_tool_kit_fragment = gql`
    fragment medication_tool_answer on medication_tool_kit_answers {
      id
      user_id
      tool_kit_id
      name
      doses
      in_stock
      feeling
      instructions
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly weight_tool_kit_fragment = gql`
    fragment weight_intake_tool_kit_answer on weight_intake_tool_kit_answers {
      id
      user_id
      tool_kit_id
      weight
      length
      bmi
      feeling
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly video_tool_kit_fragment = gql`
    fragment video_tool_kit_answer on video_tool_kit_answers {
      id
      user_id
      tool_kit_id
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly podcast_tool_kit_fragment = gql`
    fragment podcast_tool_kit_answer on podcast_tool_kit_answers {
      id
      user_id
      tool_kit_id
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly running_tool_kit_fragment = gql`
    fragment running_tool_kit_answer on running_tool_kit_answers {
      id
      user_id
      tool_kit_id
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly sleep_check_tool_kit_fragment = gql`
    fragment sleep_check_tool_kit_answer on sleep_check_tool_kit_answers {
      id
      user_id
      tool_kit_id
      in_sleep_time
      wake_up_time
      quality_of_sleep
      night_activity
      deep_sleep_time
      light_sleep_time
      out_bed_time
      wake_up
      in_bed_time
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
      total_sleep_time
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly steps_tool_kit_fragment = gql`
    fragment steps_tool_kit_answer on steps_tool_kit_answers {
      id
      user_id
      tool_kit_id
      steps
      distance
      feeling
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action ,which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly heart_rate_tool_kit_fragment = gql`
    fragment heart_rate_tool_kit_answer on heart_rate_tool_kit_answers {
      id
      user_id
      tool_kit_id
      highest_heart_rate
      lowest_heart_rate
      average_heart_rate
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly ecg_tool_kit_fragment = gql`
    fragment ecg_tool_kit_answer on ecg_tool_kit_answers {
      id
      user_id
      tool_kit_id
      spm
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly sports_tool_kit_fragment = gql`
    fragment sports_tool_kit_answer on sports_tool_kit_answers {
      id
      user_id
      tool_kit_id
      feeling
      duration
      activity {
        id
        title
        emoji
      }
      intensity {
        id
        title
      }
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action ,which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly bp_tool_kit_fragment = gql`
    fragment blood_pressure_tool_kit_answer on blood_pressure_tool_kit_answers {
      id
      user_id
      tool_kit_id
      highest_bp
      lowest_bp
      average_bp
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly activity_tool_kit_fragment = gql`
    fragment activity_tool_kit_answer on activity_tool_kit_answers {
      id
      user_id
      tool_kit_id
      activity_time
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action ,which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly drink_water_tool_kit_fragment = gql`
    fragment drink_water_tool_kit_answer on drink_water_tool_kit_answers {
      id
      user_id
      tool_kit_id
      note
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   * @deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly forms_tool_kit_fragment = gql`
    fragment user_form_answer on user_form_answers {
      id
      user_id
      tool_kit_id
      form {
        id
        title
      }
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   *@deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private readonly episodes_tool_kit_fragment = gql`
    fragment episode_form_answer on user_form_answers {
      id
      user_id
      tool_kit_id
      form {
        id
        title
      }
      episode_id
      created_at
      session_date
      schedule_id
      hlp_points_earned
      session_id
    }
  `;

  /**
   *@description follow_user event triger are used
   */
  private readonly user_frined_fragment = gql`
    fragment user_friend on user_friends {
      id
      user_id
      friend_id
      created_at
      updated_at
    }
  `;

  async getUserByEmailOrPukId(
    puk_reference_id: string,
    email: string,
    role: string,
  ): Promise<Users[]> {
    const query = `SELECT * FROM users where puk_reference_id = $1 OR email ILIKE $2 AND role = $3`;
    const user = await this.database.query<Users>(query, [
      puk_reference_id,
      email,
      role,
    ]);
    return user;
  }

  async getUser(email: string, role: string): Promise<Users[]> {
    const query = `SELECT * FROM users where email ILIKE $1 AND role = $2`;
    const user = await this.database.query<Users>(query, [email, role]);
    return user;
  }

  async getUserByEmail(email: string): Promise<Users> {
    const query = `SELECT * FROM users where email ILIKE $1`;
    const [user] = await this.database.query<Users>(query, [email]);
    return user;
  }

  async getUserByUserName(userName: string, role: string): Promise<Users> {
    const query = `SELECT * FROM users where LOWER(user_name)=LOWER($1) AND role = $2`;
    const [user] = await this.database.query<Users>(query, [userName, role]);
    return user;
  }

  async saveUserNotificationSettings(
    userId: string,
  ): Promise<UserNotificationSettings> {
    const query = `INSERT INTO user_notification_settings(user_id,
      play_reminder_sound,
      reminder_sound,
      allow_reminder_email_notification,
      allow_reminder_push_notification,
      allow_community_email_notification,
      allow_community_push_notification,
      allow_post_reaction_email_notification,
      allow_post_reaction_push_notification,
      allow_informational_email_notification)
      values($1,$3,'',$2,$3,$2,$2,$2,$2,$2) RETURNING *`;
    const [userNotification] =
      await this.database.query<UserNotificationSettings>(query, [
        userId,
        'false',
        'true',
      ]);
    return userNotification;
  }

  async saveUser(
    user: UserSignupDto | AdminSignupDto | RegisterUserInput,
  ): Promise<any> {
    const parameters = [...Object.values(user)];
    const query =
      'INSERT INTO users (' +
      Object.keys(user)
        .map((key) => `${key}`)
        .join(', ') +
      ') VALUES (' +
      Object.values(user)
        .map((value, index) => `$${index + 1}`)
        .join(', ') +
      ') RETURNING *;';

    const [newUser] = await this.database.query<Users>(query, parameters);
    return newUser;
  }

  /**@deprecated use the migrated function @function updateUser */
  async updateUserById(userId: string, updates: UserUpdateDto): Promise<Users> {
    const parameters = [...Object.values(updates), userId];
    const query =
      'UPDATE users SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;

    const [updatedUser] = await this.database.query<Users>(query, parameters);
    return updatedUser;
  }

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT *,COALESCE(hlp_reward_points_balance,0) AS hlp_reward_points_balance FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  /**
   * @deprecated Unused Code
   */
  getUserByIdQuery(): string {
    const query = gql`
      query getUserById($id: uuid!) {
        users_by_pk(id: $id) {
          ...user
        }
      }
      ${this.userFragment}
    `;
    return query;
  }

  /**
   * @deprecated Unused Code
   */
  async getBlackListedUserNames(
    user_name: string,
  ): Promise<BlackListedUserName[]> {
    const query = gql`
      query ($user_name: String!) {
        black_listed_user_names(where: { user_name: { _ilike: $user_name } }) {
          user_name
        }
      }
    `;
    const { black_listed_user_names } = await this.client.request<{
      black_listed_user_names: BlackListedUserName[];
    }>(query, { user_name });
    return black_listed_user_names;
  }

  async getAllBlackListedUserNames(): Promise<BlackListedUserName[]> {
    const query = `SELECT id, user_name FROM black_listed_user_names`;
    const blackListedUser = await this.database.query<BlackListedUserName>(
      query,
      [],
    );
    return blackListedUser;
  }

  async getOnboardingByUserId(userId: string): Promise<LoginOnboarding> {
    const query = `SELECT screen,is_completed FROM onboardings where "userId" = $1`;
    const [onboardings] = await this.database.query<LoginOnboarding>(query, [
      userId,
    ]);
    return onboardings;
  }

  /**
   *@deprecated This Repo used in getToolKitHistory action ,which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  public async getToolKitAnswerHistory(
    body: ToolKitHistoryDTO,
  ): Promise<ToolKitAnswerHistoryDTO> {
    const table_name: any =
      body.tool_kit_type == ToolKitTypes.EPISODES
        ? ToolKitTypesAnswerTables.FORM
        : this.getTableName(body.tool_kit_type);
    const fragmentData =
      body.tool_kit_type == ToolKitTypes.EPISODES
        ? {
            fragment: this.episodes_tool_kit_fragment,
            name: '...episode_form_answer',
            fieldName: 'episode_tool_kit_history',
          }
        : this.getFragmentAndFieldName(table_name);
    const form_and_episode_tool_kit_query =
      body.tool_kit_type == ToolKitTypes.FORM ||
      body.tool_kit_type == ToolKitTypes.EPISODES
        ? 'tool_kit_id:{_eq:$tool_kit_id}'
        : '';
    const query_condition = body.date
      ? `_and:[{user_id:{_eq:$user_id}},{session_date:{_eq:$session_date}}${
          form_and_episode_tool_kit_query
            ? `,{${form_and_episode_tool_kit_query}}`
            : ''
        }]`
      : `user_id:{_eq:$user_id}${
          form_and_episode_tool_kit_query
            ? `,${form_and_episode_tool_kit_query}`
            : ''
        }`;
    const query = gql`
      query getToolKitHistory($user_id:uuid!,$session_date:date,$tool_kit_id:uuid){
        ${table_name}(where:{${query_condition}}){
          ${fragmentData?.name}
        }
      }
      ${fragmentData?.fragment}
    `;
    const tool_kit_history: any = await this.client.request(query, {
      user_id: body.user_id,
      session_date: body.date || undefined,
      tool_kit_id:
        body.tool_kit_type == ToolKitTypes.FORM ||
        body.tool_kit_type == ToolKitTypes.EPISODES
          ? body.tool_kit_id
          : undefined,
    });
    const streaks: Array<ToolkitStreak> =
      await this.streakService.getUserToolkitStreaksHistory(
        body.user_id,
        body.tool_kit_id,
      );
    const rewardsData = await this.toolkitService.getRewardsData(
      body.user_id,
      body.tool_kit_id,
    );
    const data = this.calculateTotalPointsAndPrepareResponse(
      tool_kit_history[table_name],
      body.tool_kit_type,
      streaks,
    );
    this.logger.log(data);
    return { rewards: rewardsData, ...data };
  }

  /**
   *@deprecated This Repo used in getToolKitHistory action ,which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private getFragmentAndFieldName(
    table_name: string,
  ): FragmentsAndFieldNameDto {
    switch (table_name) {
      case ToolKitTypesAnswerTables.ALCOHOL_INTAKE:
        return {
          fragment: this.alcohol_tool_kit_fragment,
          name: '...alcohol_tool_answer',
          fieldName: 'alcohol_intake_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.MEDITATION:
        return {
          fragment: this.meditation_tool_kit_fragment,
          name: '...meditation_tool_answer',
          fieldName: 'meditation_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.MEDICATION:
        return {
          fragment: this.medication_tool_kit_fragment,
          name: '...medication_tool_answer',
          fieldName: 'medication_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.WEIGHT:
        return {
          fragment: this.weight_tool_kit_fragment,
          name: '...weight_intake_tool_kit_answer',
          fieldName: 'weight_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.VIDEO:
        return {
          fragment: this.video_tool_kit_fragment,
          name: '...video_tool_kit_answer',
          fieldName: 'video_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.PODCAST:
        return {
          fragment: this.podcast_tool_kit_fragment,
          name: '...podcast_tool_kit_answer',
          fieldName: 'podcast_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.RUNNING:
        return {
          fragment: this.running_tool_kit_fragment,
          name: '...running_tool_kit_answer',
          fieldName: 'running_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.HEART_RATE:
        return {
          fragment: this.heart_rate_tool_kit_fragment,
          name: '...heart_rate_tool_kit_answer',
          fieldName: 'heart_rate_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.SLEEP_CHECK:
        return {
          fragment: this.sleep_check_tool_kit_fragment,
          name: '...sleep_check_tool_kit_answer',
          fieldName: 'sleep_check_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.STEPS:
        return {
          fragment: this.steps_tool_kit_fragment,
          name: '...steps_tool_kit_answer',
          fieldName: 'steps_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.ECG:
        return {
          fragment: this.ecg_tool_kit_fragment,
          name: '...ecg_tool_kit_answer',
          fieldName: 'ecg_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.ACTIVITY:
        return {
          fragment: this.activity_tool_kit_fragment,
          name: '...activity_tool_kit_answer',
          fieldName: 'activity_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.BLOOD_PRESSURE:
        return {
          fragment: this.bp_tool_kit_fragment,
          name: '...blood_pressure_tool_kit_answer',
          fieldName: 'blood_pressure_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.SPORT:
        return {
          fragment: this.sports_tool_kit_fragment,
          name: '...sports_tool_kit_answer',
          fieldName: 'sport_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.DRINK_WATER:
        return {
          fragment: this.drink_water_tool_kit_fragment,
          name: '...drink_water_tool_kit_answer',
          fieldName: 'drink_water_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.FORM:
        return {
          fragment: this.forms_tool_kit_fragment,
          name: '...user_form_answer',
          fieldName: 'form_tool_kit_history',
        };
      case ToolKitTypesAnswerTables.EPISODES:
        return {
          fragment: this.episodes_tool_kit_fragment,
          name: '...episode_form_answer',
          fieldName: 'episode_tool_kit_history',
        };
    }
  }

  /**
   *@deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private getTableName(tool_kit_type: string): ToolKitTypesAnswerTablesDto {
    switch (tool_kit_type) {
      case ToolKitTypes.DRINK_WATER:
        return ToolKitTypesAnswerTables.DRINK_WATER;
      case ToolKitTypes.RUNNING:
        return ToolKitTypesAnswerTables.RUNNING;
      case ToolKitTypes.VIDEO:
        return ToolKitTypesAnswerTables.VIDEO;
      case ToolKitTypes.ACTIVITY:
        return ToolKitTypesAnswerTables.ACTIVITY;
      case ToolKitTypes.MEDITATION:
        return ToolKitTypesAnswerTables.MEDITATION;
      case ToolKitTypes.PODCAST:
        return ToolKitTypesAnswerTables.PODCAST;
      case ToolKitTypes.SLEEP_CHECK:
        return ToolKitTypesAnswerTables.SLEEP_CHECK;
      case ToolKitTypes.STEPS:
        return ToolKitTypesAnswerTables.STEPS;
      case ToolKitTypes.HEART_RATE:
        return ToolKitTypesAnswerTables.HEART_RATE;
      case ToolKitTypes.BLOOD_PRESSURE:
        return ToolKitTypesAnswerTables.BLOOD_PRESSURE;
      case ToolKitTypes.WEIGHT:
        return ToolKitTypesAnswerTables.WEIGHT;
      case ToolKitTypes.MEDICATION:
        return ToolKitTypesAnswerTables.MEDICATION;
      case ToolKitTypes.ECG:
        return ToolKitTypesAnswerTables.ECG;
      case ToolKitTypes.FORM:
        return ToolKitTypesAnswerTables.FORM;
      case ToolKitTypes.EPISODES:
        return ToolKitTypesAnswerTables.EPISODES;
      case ToolKitTypes.HABIT:
        return ToolKitTypesAnswerTables.HABIT;
      case ToolKitTypes.ALCOHOL_INTAKE:
        return ToolKitTypesAnswerTables.ALCOHOL_INTAKE;
      case ToolKitTypes.SPORT:
        return ToolKitTypesAnswerTables.SPORT;
    }
  }

  /**
   *@deprecated This Repo used in getToolKitHistory action ,which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private calculateTotalPointsAndPrepareResponse(
    history_data: Array<any>,
    tool_kit_type: any,
    streaks: Array<ToolkitStreak>,
  ): ToolKitHistoryResponse {
    const tool_kit_history: ToolKitHistoryResponse = {
      hlp_reward_points_earned: 0,
      history: [],
      streaks,
    };
    // tool_kit_history[String(fieldName)] = history_data;
    history_data.forEach((history) => {
      tool_kit_history.hlp_reward_points_earned += history.hlp_points_earned;
      const fieldName: any =
        this.getHistoryFieldName(tool_kit_type)?.split(',');
      let fieldAnswer = '';
      if (fieldName?.length === 1) {
        fieldAnswer =
          tool_kit_type == ToolKitTypes.FORM ||
          tool_kit_type == ToolKitTypes.EPISODES
            ? history['form']['title']
            : String(history[fieldName[0]]);
      } else {
        fieldName?.forEach((name: any) => {
          fieldAnswer = !fieldAnswer
            ? String(history[name])
            : tool_kit_type == ToolKitTypes.MEDICATION
            ? `${fieldAnswer.concat(` (${String(history[name])})`)}`
            : fieldAnswer.concat(`-${String(history[name])}`);
        });
      }
      tool_kit_history.history.push({
        answer: fieldAnswer,
        emoji: this.getEmojiValue(history, tool_kit_type) as string,
        session_date: new Date(history.session_date),
      });
    });
    return tool_kit_history;
  }

  /**
   *@deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private getEmojiValue(
    answer_data: any,
    tool_kit_type: string,
  ): string | null {
    switch (tool_kit_type) {
      case ToolKitTypes.SPORT:
        return String(answer_data.activity.emoji);
      case ToolKitTypes.ALCOHOL_INTAKE:
        return String(answer_data.alchohol_type.emoji);
      default:
        return null;
    }
  }

  /**
   *@deprecated This Repo used in getToolKitHistory action , which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
   */
  private getHistoryFieldName(tool_kit_type: string): string | undefined {
    switch (tool_kit_type) {
      case ToolKitTypes.DRINK_WATER:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.DRINK_WATER;
      case ToolKitTypes.RUNNING:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.RUNNING;
      case ToolKitTypes.VIDEO:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.VIDEO;
      case ToolKitTypes.ACTIVITY:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.ACTIVITY;
      case ToolKitTypes.MEDITATION:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.MEDITATION;
      case ToolKitTypes.PODCAST:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.PODCAST;
      case ToolKitTypes.SLEEP_CHECK:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.SLEEP_CHECK;
      case ToolKitTypes.STEPS:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.STEPS;
      case ToolKitTypes.HEART_RATE:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.HEART_RATE;
      case ToolKitTypes.BLOOD_PRESSURE:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.BLOOD_PRESSURE;
      case ToolKitTypes.WEIGHT:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.WEIGHT;
      case ToolKitTypes.MEDICATION:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.MEDICATION;
      case ToolKitTypes.ECG:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.ECG;
      case ToolKitTypes.FORM:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.FORM;
      case ToolKitTypes.EPISODES:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.EPISODES;
      case ToolKitTypes.HABIT:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.HABIT;
      case ToolKitTypes.ALCOHOL_INTAKE:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.ALCOHOL_INTAKE;
      case ToolKitTypes.SPORT:
        return HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT.SPORT;
    }
  }

  /**
   *@deprecated This Repo used in getDasboard action , which is not used from app side(in app side they are using getUserDashboard reolver name)
   */
  private updateScreeNameMutation(): string {
    const mutation = gql`
      mutation UpdateScreenName(
        $userId: uuid!
        $screen: onboarding_screen_enum!
        $is_completed: Boolean!
      ) {
        insert_onboardings_one(
          object: {
            userId: $userId
            screen: $screen
            is_completed: $is_completed
          }
          on_conflict: {
            constraint: onboardings_pkey
            update_columns: [screen, is_completed]
          }
        ) {
          is_completed
          screen
          userId
        }
      }
    `;
    return mutation;
  }

  /**
   * This Service used in getDasboard action , which is not used from app side(in app side they are using getUserDashboard
   * This function is deprecated and should not be used.
   * This code is only included for backward compatibility.
   * Use the @function getDashboard() function  instead in schedule module.
   * @deprecated
   */
  async updateScreeName(userId: string): Promise<updateScreeNameResponseDto> {
    const mutation = this.updateScreeNameMutation();
    type result = { insert_onboardings_one: unknown };
    const variables = {
      userId,
      screen: 'email_verification',
      is_completed: true,
    };
    return this.client.request<result>(mutation, variables);
  }

  /**
   * @deprecated its's migrated to getCampaigns
   */
  async getAllCampaignList(): Promise<CampaignInfo[]> {
    const query = gql`
      query GetCampaignInfoAllDonationsOfCampaign {
        campaign {
          id
          title
          short_description
          image_url
          image_id
          file_path
          campaign_goal
          is_campaign_goal_fulfilled
          campaign_donations_aggregate {
            aggregate {
              sum {
                hlp_reward_points_donated
              }
            }
          }
        }
      }
    `;
    const response: CampaignListResponse = await this.client.request(query);
    return response.campaign;
  }

  /**
   * @description schedules event trigger are used
   */
  public createUserChallengesRecord(data: UserScheduleDTO): Promise<unknown> {
    const mutation = gql`
      mutation CreateUserChallengesRecord(
        $user_id: uuid!
        $challenge_id: uuid!
      ) {
        insert_user_challenges_one(
          object: { user_id: $user_id, challenge_id: $challenge_id }
          on_conflict: {
            constraint: user_is_unique_for_each_challenge
            update_columns: [user_id, challenge_id]
          }
        ) {
          id
        }
      }
    `;
    return this.client.request(mutation, {
      user_id: data.user,
      challenge_id: data.challenge_id,
    });
  }

  /**
   *@deprecated unable to find in Action
   */
  public async getChallengeDetails(challenge_id: string) {
    const query = gql`
      query GetChallengeInfo($challenge_id: uuid!) {
        challenges_by_pk(id: $challenge_id) {
          title
          challenge_start_date
          challenge_end_date
          is_challenge_completed
          hlp_reward_points_required_for_completing_goal
          hlp_reward_points_required_for_winning_challenge
          total_days
          tool_kit {
            tool_kit_type
          }
        }
      }
    `;
    const challenge_info: any = await this.client.request(query, {
      challenge_id,
    });
    return challenge_info.challenges_by_pk;
  }

  /**
   *@deprecated unable to find in Action
   */
  public async getUserChallenges(
    challenge_id: string,
    tool_kit_type: string,
  ): Promise<UserChallengesResponseDto> {
    const table_name = `${
      tool_kit_type != ToolKitTypes.EPISODES
        ? this.getTableName(tool_kit_type)
        : ToolKitTypesAnswerTables.FORM
    }_aggregate`;
    const query = gql`
      query GetUserchallenges($challenge_id: uuid!) {
        user_challenges(where: { challenge_id: { _eq: $challenge_id } }) {
          id
          user {
            id
            user_name
            avatar
            full_name
            ${table_name}(where:{challenge_id:{_eq:$challenge_id}}){
              aggregate{
                sum{
                  hlp_points_earned
                }
              }
            }
          }
        }
      }
    `;
    const response: any = await this.client.request(query, { challenge_id });
    return {
      table_name,
      user_challenges: response.user_challenges,
    };
  }

  /**
   *@deprecated Unused Code
   */
  public async getUserMembershipStageInfo(user_id: string) {
    const query = gql`
      query GetUserMembershipStageInfo($user_id: uuid!) {
        users_by_pk(id: $user_id) {
          current_membership_stage_id
        }
      }
    `;
    const response: any = await this.client.request(query, { user_id });
    return response.users_by_pk.current_membership_stage_id;
  }

  /**
   *@deprecated Unused Code
   */
  public async getShopItemPriceAndPoints(
    shop_item_id: string,
    membership_stage_id: string,
  ): Promise<any> {
    const query = gql`
      query GetShopItemPriceAndPoints(
        $shop_item_id: uuid!
        $membership_stage_id: uuid!
      ) {
        shop_item_prices(
          where: {
            _and: [
              { shop_item_id: { _eq: $shop_item_id } }
              { membership_stage_id: { _eq: $membership_stage_id } }
            ]
          }
        ) {
          hlp_reward_points_required
          item_price
        }
      }
    `;
    const response: any = await this.client.request(query, {
      shop_item_id,
      membership_stage_id,
    });
    return response.shop_item_prices;
  }

  /**
   * @deprecated Action name is GetToolKitByUserGoalsAndToolKitCategory, which is not used from app side(in app side they are using gettoolkitCategory resolver name)
   */
  public async getUserGoals(user_id: string) {
    const query = gql`
      query GetUserGoals($user_id: uuid!) {
        user_goals(where: { user_id: { _eq: $user_id } }) {
          goal
        }
      }
    `;
    const response: any = await this.client.request(query, { user_id });
    return response.user_goals;
  }

  /**
   * @deprecated Action name is GetToolKitByUserGoalsAndToolKitCategory, which is not used from app side(in app side they are using gettoolkitCategory resolver name)
   */
  public async GetToolKitByUserGoalsAndToolKitCategory(
    tool_kit_category_id: string,
    user_goals: Array<string>,
  ): Promise<unknown> {
    const query = gql`
      query GetToolKitByUserGoalsAndToolKitCategory(
        $tool_kit_category_id: uuid!
        $user_goals: [uuid!]!
      ) {
        tool_kit_category_by_pk(id: $tool_kit_category_id) {
          id
          title
          description
        }
        tool_kit_sub_category(
          where: { tool_kit_category: { _eq: $tool_kit_category_id } }
        ) {
          id
          title
          tool_kits(where: { goal_id: { _in: $user_goals } }) {
            id
            title
            short_description
            image_url
            image_id
            file_path
            tool_kit_type
          }
        }
        tool_kits(
          where: {
            _and: [
              { tool_kit_category: { _eq: $tool_kit_category_id } }
              { goal_id: { _in: $user_goals } }
              { is_whats_new_tool_kit: { _eq: true } }
            ]
          }
        ) {
          id
          title
          short_description
          image_url
          image_id
          file_path
          tool_kit_type
        }
      }
    `;
    return await this.client.request(query, {
      tool_kit_category_id,
      user_goals,
    });
  }

  // get's habit tool end date

  public async getHabitToolEndDate(tool_kit_id: string): Promise<Toolkit> {
    const query = `SELECT * FROM tool_kits WHERE id = $1;`;
    const [data] = await this.database.query<Toolkit>(query, [tool_kit_id]);
    return data;
  }

  /**
   *@deprecated This Repo used in PurchaseReminderTone action , which is not used from app side(in app side they are using purchaseReminderTone resolver name)
   */
  public async checkUserReminderTonePurchaseHistory(body: BuyReminderToneDTO) {
    const query = gql`
      query CheckUserReminderTonePurchaseHistory(
        $user_id: uuid!
        $reminder_tone_id: uuid!
      ) {
        user_reminder_tone_purchases(
          where: {
            _and: [
              { user_id: { _eq: $user_id } }
              { reminder_tone_id: { _eq: $reminder_tone_id } }
            ]
          }
        ) {
          id
        }
      }
    `;
    const response: any = await this.client.request(query, { ...body });
    return response.user_reminder_tone_purchases;
  }

  /**
   *@deprecated This Repo used in PurchaseReminderTone action , which is not used from app side(in app side they are using purchaseReminderTone resolver name)
   */
  public async purchaseReminderTone(
    body: BuyReminderToneDTO,
  ): Promise<UserReminderTone> {
    const mutation = gql`
      mutation PurchaseReminderTone(
        $data: user_reminder_tone_purchases_insert_input!
      ) {
        insert_user_reminder_tone_purchases_one(object: $data) {
          ...user_reminder_tone_purchase
        }
      }
      ${userReminderTonePurchaseFragment}
    `;
    type result = { insert_user_reminder_tone_purchases_one: UserReminderTone };
    const { insert_user_reminder_tone_purchases_one } =
      await this.client.request<result>(mutation, { data: body });
    return insert_user_reminder_tone_purchases_one;
  }

  public async getReminderTone(reminderToneId: string): Promise<ReminderTone> {
    const query = `SELECT * FROM reminder_tones WHERE id = $1`;
    const [reminderTone] = await this.database.query<ReminderTone>(query, [
      reminderToneId,
    ]);
    return reminderTone;
  }

  /**
   * @deprecated Action name is CheckIfUserHasJoinedChallenge, which is not used from app side(in app side they are using @function getToolkitDetails() and  getTookitDetails resolver name )
   */
  public async getToolKitChallenges(tool_kit_id: string): Promise<unknown> {
    const query = gql`
      query GetToolKitChallenges($tool_kit_id: uuid) {
        challenges(
          where: {
            _and: [
              { is_challenge_completed: { _eq: false } }
              { tool_kit_id: { _eq: $tool_kit_id } }
            ]
          }
        ) {
          id
        }
      }
    `;
    return this.client.request(query, { tool_kit_id });
  }

  /**
   *@deprecated Unused Code
   */
  public async getToolkitOptionsQuery(): Promise<string> {
    const query = gql`
    query (toolkitId: uuid!, userId: uuid!){
      tool_kit(where: {_id: { _eq: toolkitId } } ){
        ...toolkit
      }
    }
    ${toolkitFragment}
    `;
    return query;
  }

  /**
   * @deprecated Action name is CheckIfUserHasJoinedChallenge, which is not used from app side(in app side they are using @function getToolkitDetails() and  getTookitDetails resolver name )
   */
  public async getUserChallengesList(
    user_id: string,
    challenges: Array<string>,
  ): Promise<unknown> {
    const query = gql`
      query GetUserChallengesList($user_id: uuid!, $challenges: [uuid]!) {
        user_challenges(
          where: {
            _and: [
              { user_id: { _eq: $user_id } }
              { challenge_id: { _in: $challenges } }
            ]
          }
        ) {
          challenge_id
        }
      }
    `;
    return this.client.request(query, { user_id, challenges });
  }

  async getExtraInfoByType(type: string): Promise<ExtraInformation> {
    const query = `SELECT * FROM extra_informations WHERE extra_information_type=$1`;
    const [extraInfo] = await this.database.query<ExtraInformation>(query, [
      type,
    ]);
    return extraInfo;
  }

  public async getExtraInformation(
    data: GetExtraInformationArgs,
  ): Promise<ExtraInformation | EntityExtraInformation> {
    const extraInformationTable = ExtraInformationTableName.get(
      data.extra_info_type,
    );
    if (!extraInformationTable) {
      return this.getExtraInfoByType(data.extra_info_type);
    }
    const extraInfo = await this.getEntityExtraInfomationQuery(
      data,
      extraInformationTable,
    );
    return extraInfo;
  }

  private async getEntityExtraInfomationQuery(
    data: GetExtraInformationArgs,
    tableName: string,
  ): Promise<EntityExtraInformation> {
    const query = `SELECT extra_information_title,extra_information_description, translations FROM ${tableName} WHERE id=$1`;
    const [entity] = await this.database.query<EntityExtraInformation>(query, [
      data.id,
    ]);
    return entity;
  }

  async saveShopItemPurchase(
    purchase: ShopitemPurchaseDto,
  ): Promise<ShopitemPurchase> {
    const parameters = [...Object.values(purchase)];
    const query =
      'INSERT INTO shop_item_purchases (' +
      Object.keys(purchase)
        .map((key) => `${key}`)
        .join(', ') +
      ') VALUES (' +
      Object.values(purchase)
        .map((value, index) => `$${index + 1}`)
        .join(', ') +
      ') RETURNING *;';
    const [newPurchase] = await this.database.query<ShopitemPurchase>(
      query,
      parameters,
    );
    return newPurchase;
  }

  /**
   *@deprecated Unused Code
   */
  private getRewardByDonationIdQuery(): string {
    const query = gql`
      query ($donation_id: uuid!) {
        user_rewards(where: { user_donation_id: { _eq: $donation_id } }) {
          ...reward
        }
      }
      ${rewardFragment}
    `;
    return query;
  }

  /**
   *@deprecated Unused Code
   */
  async getRewardByDonationId(id: string): Promise<UserReward> {
    const query = this.getRewardByDonationIdQuery();
    type result = { reward: UserReward };
    const { reward } = await this.client.request<result>(query, {
      donation_id: id,
    });
    return reward;
  }

  /**
   * @description follow_user event trigger are used
   */
  public async getFriendFollowed(
    userFriendsBody: UserFriendsBody,
  ): Promise<UserFriends[]> {
    const query = gql`
      query GetUserFriend($id: uuid!, $friend_id: uuid!, $user_id: uuid!) {
        user_friends(
          where: {
            _and: [
              { id: { _eq: $id } }
              { friend_id: { _eq: $friend_id } }
              { user_id: { _eq: $user_id } }
            ]
          }
        ) {
          ...user_friend
        }
      }
      ${this.user_frined_fragment}
    `;
    const { id, friend_id, user_id } = userFriendsBody;
    const userFriend = await this.client.request<{
      user_friends: Array<UserFriends>;
    }>(query, { id, friend_id, user_id });
    return userFriend.user_friends;
  }

  /**
   *@deprecated Unused Code
   */
  private getShopItemByIdAndUserMembershipStagesQuery(): string {
    const query = gql`
      query ($id: uuid!, $user_id: uuid!) {
        shop_item: shop_items_by_pk(id: $id) {
          ...shop_item
          shop_item_prices {
            ...shop_item_price
          }
        }
        membership_stages: user_membership_stages(
          where: { user_id: { _eq: $user_id } }
        ) {
          ...user_membership_stage
        }
      }
      ${shopItemPriceFragment}
      ${userMembershipStageFragment}
      ${shopItemFragment}
    `;
    return query;
  }

  /**
   *@deprecated Unused Code
   */
  async getShopItemByIdAndUserMembershipStages(
    id: string,
    userId: string,
  ): Promise<GetShopItemByIdAndUserMembershipStagesResponse> {
    const query = this.getShopItemByIdAndUserMembershipStagesQuery();
    const response =
      await this.client.request<GetShopItemByIdAndUserMembershipStagesResponse>(
        query,
        { id, user_id: userId },
      );
    return response;
  }

  async getUserByIdNew(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async addHlpPoints(hlpPoints: number, userId: string): Promise<Users> {
    const query = `UPDATE users
    SET hlp_reward_points_balance = COALESCE(hlp_reward_points_balance, 0) + ${hlpPoints}
    WHERE id=$1 RETURNING *;`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async reduceHlpPoints(
    hlpPoints: number,
    userId: string,
  ): Promise<Users | undefined> {
    const query = `UPDATE users
    SET hlp_reward_points_balance = COALESCE(hlp_reward_points_balance, 0) - $2
    WHERE id=$1 AND hlp_reward_points_balance>=$2  RETURNING *;`;
    const [user] = await this.database.query<Users>(query, [userId, hlpPoints]);
    return user;
  }

  async addUserDonations(userDonation: UserDonation): Promise<UserDonation> {
    const parameters = [...Object.values(userDonation)];
    const query =
      'INSERT INTO user_donations (' +
      Object.keys(userDonation)
        .map((key) => `${key}`)
        .join(', ') +
      ') VALUES (' +
      Object.values(userDonation)
        .map((value, index) => `$${index + 1}`)
        .join(', ') +
      ') RETURNING *;';

    const [newUserDonation] = await this.database.query<UserDonation>(
      query,
      parameters,
    );
    return newUserDonation;
  }
  async updateServiceOfferPurchase(
    serviceOfferPurchaseId: string,
    transctionId: string,
    transactionStatus: string,
  ): Promise<ServiceOfferPurchase> {
    const query = `UPDATE service_offer_purchases
    SET transaction_status = $1, transaction_reference_id = $2
    WHERE id = $3 RETURNING *;`;
    const [serviceOfferPurchase] =
      await this.database.query<ServiceOfferPurchase>(query, [
        transactionStatus,
        transctionId,
        serviceOfferPurchaseId,
      ]);
    return serviceOfferPurchase;
  }

  async getUserOnboarding(userId: string): Promise<Onboarding> {
    const query = `SELECT * FROM onboardings WHERE "userId"=$1`;
    const [onboarding] = await this.database.query<Onboarding>(query, [userId]);
    return onboarding;
  }

  async saveUserSecurityAndPrivacySettings(
    userId: string,
  ): Promise<UserSecurityAndPrivacySettings> {
    const query = `INSERT INTO user_security_and_privacy_settings(
      user_id,
      app_access_pin,
      app_lock_enabled,
      my_posts_can_be_seen_by_all_users,
      my_posts_can_be_seen_by_my_friends)
      values($1,'',$2,$2,$2) RETURNING *`;
    const [userPrivacySettings] =
      await this.database.query<UserSecurityAndPrivacySettings>(query, [
        userId,
        'false',
      ]);
    return userPrivacySettings;
  }

  async getHelpedUsers(userId: string): Promise<HelpedUser[]> {
    const query = `SELECT DISTINCT ON (user_donations.donor_user_id) users.id, users.full_name, users.avatar, users.user_name, users.avatar_image_name , users.avatar_type , users.file_path
    FROM user_donations
    JOIN users ON users.id=user_donations.donor_user_id
    WHERE user_donations.receiver_user_id=$1 AND user_donations.donor_user_id NOT IN (SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id=$1)`;
    const users = await this.database.query<HelpedUser>(query, [userId]);
    return users;
  }

  async getFriendsList(userId: string): Promise<Friend[]> {
    const query = `SELECT DISTINCT ON (user_friends.friend_id) users.id, users.full_name,users.avatar, users.user_name, users.avatar_image_name,users.avatar_type
    FROM user_friends
    JOIN users ON users.id=user_friends.friend_id
    WHERE user_friends.user_id=$1
    AND user_friends.friend_id NOT IN (SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id=$1)`;
    const users = await this.database.query<Friend>(query, [userId]);
    return users;
  }

  async getShopItemPurchaseByVoucher(
    voucherCode: string,
  ): Promise<ShopitemPurchase> {
    const query = `SELECT * FROM shop_item_purchases WHERE shop_item_purchases.voucher_code = $1`;
    const [shopItemPurchase] = await this.database.query<ShopitemPurchase>(
      query,
      [voucherCode],
    );
    return shopItemPurchase;
  }

  async getBlockedUserList(userId: string): Promise<BlockedUserList[]> {
    const query = `SELECT users.* FROM users
    WHERE users.id IN (
    SELECT blocked_users.blocked_user_id
    FROM blocked_users
    WHERE blocked_users.blocked_by_user_id =$1
    )`;
    const blockedUser = await this.database.query<BlockedUserList>(query, [
      userId,
    ]);
    return blockedUser;
  }
  async getUserMemberStages(userId: string): Promise<UserMembershipStage[]> {
    const query = `SELECT user_membership_stages.*,membership_stages.sequence_number AS sequence_number  FROM user_membership_stages
    JOIN membership_stages ON membership_stages.id=user_membership_stages.membership_stage_id
    WHERE user_membership_stages.user_id=$1
    ORDER BY sequence_number DESC`;
    const userMembershipStages = await this.database.query<UserMembershipStage>(
      query,
      [userId],
    );
    return userMembershipStages;
  }

  async getShopItemPrices(shopItemId: string): Promise<ShopItemPrice[]> {
    const query = `SELECT shop_item_prices.*,membership_stages.sequence_number AS sequence_number FROM shop_item_prices
    JOIN membership_stages ON membership_stages.id=shop_item_prices.membership_stage_id
    WHERE shop_item_id=$1
    ORDER BY sequence_number DESC`;
    const itemPrices = await this.database.query<ShopItemPrice>(query, [
      shopItemId,
    ]);
    return itemPrices;
  }

  async getShopItem(shopItemId: string): Promise<ShopItem> {
    const query = `SELECT * FROM shop_items WHERE id=$1`;
    const [shopItem] = await this.database.query<ShopItem>(query, [shopItemId]);
    return shopItem;
  }
  async updateFullName(userId: string, fullName: string): Promise<Users> {
    const query = `UPDATE users SET full_name= $1 WHERE id= $2 RETURNING *`;
    const [user] = await this.database.query<Users>(query, [fullName, userId]);
    return user;
  }
  async addUserQuery(
    userId: string,
    userQuery: UserQueryInput,
  ): Promise<UserQuery> {
    const query = `INSERT INTO user_queries (user_id,${Object.keys(
      userQuery,
    )}) VALUES ('${userId}',${Object.keys(userQuery).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;
    const [queryUser] = await this.database.query<UserQuery>(
      query,
      Object.values(userQuery),
    );
    return queryUser;
  }
  async getSupportVideoInfo(): Promise<SupportVideoCategory[]> {
    const supportVideoQuery = `SELECT support_video_category.*,
    COALESCE(JSON_AGG(support_videos.*) FILTER (WHERE support_videos.id IS NOT NULL),'[]') AS support_videos
    FROM support_video_category
    LEFT JOIN support_videos ON support_videos.support_video_category_id=support_video_category.id
    GROUP BY support_video_category.id
    ORDER BY support_video_category.created_at DESC
    `;
    const supportVideoInfo = await this.database.query<SupportVideoCategory>(
      supportVideoQuery,
      [],
    );
    return supportVideoInfo;
  }

  async getAboutUs(): Promise<AboutUs> {
    const aboutUsQuery = `SELECT * FROM about_us`;
    const [aboutUs] = await this.database.query<AboutUs>(aboutUsQuery, []);
    return aboutUs;
  }

  async getTermsAndConditions(): Promise<TermAndCondition> {
    const termAndConditionQuery = `SELECT * FROM terms_and_conditions`;
    const [termAndConditionInfo] = await this.database.query<TermAndCondition>(
      termAndConditionQuery,
      [],
    );
    return termAndConditionInfo;
  }

  public async getReminderToneById(
    reminderToneId: string,
  ): Promise<ReminderToneNew> {
    const query = `SELECT * FROM reminder_tones WHERE id=$1`;
    const [reminderTone] = await this.database.query<ReminderToneNew>(query, [
      reminderToneId,
    ]);
    return reminderTone;
  }

  async setReminderTones(
    userId: string,
    title: string,
    fileName: string,
  ): Promise<UserNotificationSettings> {
    const query = `UPDATE user_notification_settings SET reminder_sound= $1 , reminder_sound_name= $2 WHERE user_id= $3 RETURNING *`;
    const [setReminderTone] =
      await this.database.query<UserNotificationSettings>(query, [
        fileName,
        title,
        userId,
      ]);
    return setReminderTone;
  }

  async updateUserSecurityAndPrivacySetting(
    userId: string,
    input: UserSecurityAndPrivacySettingInput,
  ): Promise<UserSecurityAndPrivacySetting> {
    const parameters = [...Object.values(input), userId];
    const query =
      'UPDATE user_security_and_privacy_settings SET ' +
      Object.keys(input)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE user_id = $${parameters.length} RETURNING *;`;
    const [UserSecurityAndPrivacySetting] =
      await this.database.query<UserSecurityAndPrivacySetting>(
        query,
        parameters,
      );
    return UserSecurityAndPrivacySetting;
  }

  async getUserPrivacyAndSecuritySettingByUserId(
    userId: string,
  ): Promise<UserSecurityAndPrivacySetting | null> {
    const userSecurityAndPrivacyQuery = `SELECT * FROM user_security_and_privacy_settings WHERE user_id=$1`;
    const [userSecurityAndPrivacySetting] =
      await this.database.query<UserSecurityAndPrivacySetting>(
        userSecurityAndPrivacyQuery,
        [userId],
      );
    return userSecurityAndPrivacySetting;
  }

  public async getBlockedUser(
    userId: string,
    blockedUserId: string,
  ): Promise<BlockedUsers> {
    const query = `SELECT * FROM  blocked_users WHERE blocked_by_user_id = $1 AND blocked_user_id = $2`;
    const [blockedUsers] = await this.database.query<BlockedUsers>(query, [
      userId,
      blockedUserId,
    ]);
    return blockedUsers;
  }

  async addBlockedUser(
    userId: string,
    blockedUserId: string,
  ): Promise<BlockedUsers> {
    const query = `INSERT INTO blocked_users(blocked_by_user_id, blocked_user_id)
    VALUES ($1, $2) RETURNING *`;
    const [blockedUserNew] = await this.database.query<BlockedUsers>(query, [
      userId,
      blockedUserId,
    ]);
    return blockedUserNew;
  }

  async removeBlockedUser(
    userId: string,
    blockedUserId: string,
  ): Promise<BlockedUsers> {
    const query = `DELETE FROM blocked_users WHERE blocked_by_user_id= $1 AND blocked_user_id =$2 RETURNING *`;
    const [blockedUser] = await this.database.query<BlockedUsers>(query, [
      userId,
      blockedUserId,
    ]);
    return blockedUser;
  }

  public async getFriendById(
    userId: string,
    friendId: string,
  ): Promise<UserFriend> {
    const query = `SELECT * FROM user_friends WHERE user_id = $1 AND friend_id = $2`;
    const [userFriend] = await this.database.query<UserFriend>(query, [
      userId,
      friendId,
    ]);
    return userFriend;
  }

  async addFriend(userId: string, friendId: string): Promise<UserFriend> {
    const query = `INSERT INTO user_friends(user_id, friend_id)
    VALUES ($1, $2) RETURNING *`;
    const [userFriends] = await Promise.all([
      this.database.query<UserFriend>(query, [userId, friendId]),
      this.database.query<UserFriend>(query, [friendId, userId]),
    ]);
    return userFriends[0];
  }

  async removeFriend(userId: string, friendId: string): Promise<UserFriend> {
    const query = `DELETE FROM user_friends WHERE user_id= $1 AND friend_id =$2 RETURNING *`;
    const [userFriend] = await Promise.all([
      this.database.query<UserFriend>(query, [userId, friendId]),
      this.database.query<UserFriend>(query, [friendId, userId]),
    ]);
    return userFriend[0];
  }

  async updateAvatarImageName(
    userId: string,
    avatarImageName: string,
  ): Promise<Users> {
    const query = `UPDATE users SET avatar_image_name= $1 WHERE id= $2 RETURNING *`;
    const [user] = await this.database.query<Users>(query, [
      avatarImageName,
      userId,
    ]);
    return user;
  }

  async getSafeguardingInfo(): Promise<SafeGuarding> {
    const query = `SELECT * FROM safeguarding`;
    const [safeguarding] = await this.database.query<SafeGuarding>(query, []);
    return safeguarding;
  }

  async getAdvocacyInfo(): Promise<Advocacy> {
    const query = `SELECT * FROM advocacy`;
    const [safeguarding] = await this.database.query<Advocacy>(query, []);
    return safeguarding;
  }

  async getSupportVideoDetail(videoId: string): Promise<SupportVideosDetail> {
    const supportVideoQuery = `SELECT support_videos.*,
    ROW_TO_JSON(support_video_category.*) AS support_video_category
    FROM support_videos
    LEFT JOIN support_video_category ON support_video_category.id=support_videos.support_video_category_id
    WHERE support_videos.id=$1
    `;
    const [supportVideoDetail] = await this.database.query<SupportVideosDetail>(
      supportVideoQuery,
      [videoId],
    );
    return supportVideoDetail;
  }

  async getPrivacyPolicy(): Promise<PrivacyPolicy> {
    const query = `SELECT * FROM privacy_policy`;
    const [privacyPolicy] = await this.database.query<PrivacyPolicy>(query, []);
    return privacyPolicy;
  }

  async updateOnboarding(
    userId: string,
    data: Partial<Onboarding>,
  ): Promise<Onboarding> {
    const params = [userId, ...Object.values(data)];
    const keys = Object.keys(data);
    const query = `UPDATE onboardings SET ${keys
      .map((key, index) => `${key}=$${index + 2}`)
      .join(',')} WHERE "userId"=$1 RETURNING *`;
    const [onboarding] = await this.database.query<Onboarding>(query, params);
    return onboarding;
  }

  async disableUserSchedules(userId: string): Promise<void> {
    const dateTime = DateTime.now().toISODate();
    const query = `UPDATE schedules SET is_schedule_disabled=true AND end_date=$2 WHERE user=$1`;
    await this.database.query(query, [userId, dateTime]);
  }

  private prepareUserPostAggregationsJoin(): string {
    const query = `
    LEFT JOIN post_images ON post_images.post_id = channel_user_posts.id
    LEFT JOIN post_videos ON post_videos.post_id = channel_user_posts.id
    LEFT JOIN (SELECT posts_hash_tags.post_id,hash_tags.* FROM posts_hash_tags JOIN hash_tags ON hash_tags.id=posts_hash_tags.hash_tag_id) posts_hash_tags ON posts_hash_tags.post_id=channel_user_posts.id
    LEFT JOIN (
      SELECT admin_posts_tools_we_love.post_id,tool_kits.* FROM admin_posts_tools_we_love JOIN tool_kits ON admin_posts_tools_we_love.tool_kit_id=tool_kits.id
    ) admin_posts_tools_we_loves ON admin_posts_tools_we_loves.post_id=channel_user_posts.id
    LEFT JOIN (
       SELECT admin_posts_tools_spotlight.post_id,tool_kits.* FROM admin_posts_tools_spotlight JOIN tool_kits ON admin_posts_tools_spotlight.tool_kit_id=tool_kits.id
    ) admin_posts_tools_spotlights ON admin_posts_tools_spotlights.post_id=channel_user_posts.id
    LEFT JOIN(
      SELECT admin_posts_challenge.post_id,challenges.*,ROW_TO_JSON(tool_kits.*) AS tool_kit FROM admin_posts_challenge
      JOIN challenges ON admin_posts_challenge.challenge_id=challenges.id
      JOIN tool_kits ON tool_kits.id=challenges.tool_kit_id
    ) admin_posts_challenges ON admin_posts_challenges.post_id=channel_user_posts.id
    LEFT JOIN channel_post_likes ON channel_post_likes.post_id=channel_user_posts.id AND channel_post_likes.user_id=$1
    `;
    return query;
  }

  private prepareUserPostAggregations(): string {
    const query = `
    COALESCE(JSON_AGG(post_images.*) FILTER (WHERE post_images.id IS NOT NULL),'[]') AS post_images,
    COALESCE(JSON_AGG(post_videos.*) FILTER (WHERE post_videos.id IS NOT NULL),'[]') AS post_videos,
    COALESCE(json_agg(channel_post_likes.*) FILTER (WHERE channel_post_likes.id IS NOT NULL),'[]') AS channel_post_likes,
    COALESCE(JSON_AGG(posts_hash_tags.*) FILTER (WHERE posts_hash_tags.id IS NOT NULL),'[]') AS posts_hash_tags,
    COALESCE(JSON_AGG(admin_posts_tools_we_loves.*) FILTER (WHERE admin_posts_tools_we_loves.id IS NOT NULL),'[]') AS admin_posts_tools_we_loves,
    COALESCE(JSON_AGG(admin_posts_tools_spotlights.*) FILTER (WHERE admin_posts_tools_spotlights.id IS NOT NULL),'[]') AS admin_posts_tools_spotlights,
    COALESCE(JSON_AGG(admin_posts_challenges.*) FILTER (WHERE admin_posts_challenges.id IS NOT NULL),'[]') AS admin_posts_challenges
    `;
    return query;
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const query = `
  SELECT
  ROW_TO_JSON(users.*) AS users,
  ROW_TO_JSON(membership_levels.*) AS membership_levels,
  ROW_TO_JSON(membership_stages.*) AS membership_stages,
  COALESCE(JSON_AGG(DISTINCT user_trophies.*) FILTER (WHERE user_trophies.id IS NOT NULL), '[]') AS user_trophies,
  COALESCE(
    (
      SELECT JSON_AGG(user_challenges)
      FROM (
        SELECT
          user_challenges.*,
          ROW_TO_JSON(challenges.*) AS challenges,
          ROW_TO_JSON(tool_kits.*) AS tool_kits
        FROM
          user_challenges
          JOIN challenges ON user_challenges.challenge_id = challenges.id
          JOIN tool_kits ON tool_kits.id = challenges.tool_kit_id
          WHERE user_challenges.user_id = 'c5337b43-dc2c-4c84-8792-6b5f9d0a430e'
          ORDER BY user_challenges.created_at DESC
      ) AS user_challenges
    ),
    '[]'
  ) AS user_challenges,
  COALESCE(COUNT(DISTINCT user_friends.friend_id), 0) AS friend_count,
  COALESCE(COUNT(DISTINCT user_donations.donor_user_id), 0) AS donation_count
  FROM
    users
  LEFT JOIN membership_levels ON membership_levels.id = users.current_membership_level_id
  LEFT JOIN membership_stages ON membership_stages.id = users.current_membership_stage_id
  LEFT JOIN (
      SELECT user_trophies.user_id, trophies.*
      FROM user_trophies
      JOIN trophies ON trophies.id = user_trophies.trophy_id
  ) AS user_trophies ON user_trophies.user_id = users.id
  LEFT JOIN user_friends ON user_friends.user_id = users.id
  AND user_friends.friend_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id = $1
        )  
  LEFT JOIN user_donations ON user_donations.receiver_user_id = users.id
  AND user_donations.donor_user_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id = $1
        ) 
   WHERE
    users.id = $1
    GROUP BY users.id, membership_levels.id, membership_stages.id;
     `;
    const [userInfo] = await this.database.query<UserInfo>(query, [userId]);
    return userInfo;
  }

  async getFavouritePosts(userId: string): Promise<FavouritePosts[]> {
    const query = `
    SELECT favourite_posts.*,
    ROW_TO_JSON(channel_user_posts.*) AS channel_user_posts
    FROM favourite_posts
    LEFT JOIN(SELECT channel_user_posts.*,
    ROW_TO_JSON(users.*) AS users,          
    ${this.prepareUserPostAggregations()}
    FROM  channel_user_posts 
    LEFT JOIN users ON users.id=channel_user_posts.user_id          
    ${this.prepareUserPostAggregationsJoin()}
    GROUP BY channel_user_posts.id, users.id
    )channel_user_posts ON channel_user_posts.id = favourite_posts.post_id AND 
    channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false
    AND channel_user_posts.user_id NOT IN (
    SELECT blocked_users.blocked_user_id
    FROM blocked_users
    WHERE blocked_users.blocked_by_user_id=$1
    )
    WHERE favourite_posts.user_id = $1
    ORDER BY favourite_posts.created_at DESC
     `;
    const favouritePosts = await this.database.query<FavouritePosts>(query, [
      userId,
    ]);
    return favouritePosts;
  }

  async getUserPosts(userId: string): Promise<UserPostDetail[]> {
    const query = `
    SELECT channel_user_posts.*,
    ROW_TO_JSON(users.*) AS users,
    ${this.prepareUserPostAggregations()}
    FROM  channel_user_posts
    LEFT JOIN users ON users.id=channel_user_posts.user_id
    ${this.prepareUserPostAggregationsJoin()}
    WHERE channel_user_posts.user_id = $1
    AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false
    GROUP BY channel_user_posts.id, users.id
    ORDER BY channel_user_posts.created_at DESC
     `;
    const userPost = await this.database.query<UserPostDetail>(query, [userId]);
    return userPost;
  }

  async getOrganisation(id: string): Promise<Organisation | null> {
    const query = 'SELECT * FROM organisations WHERE id = $1';
    const [organisation] = await this.database.query<Organisation>(query, [id]);
    return organisation;
  }

  async saveUserAddress(userAddress: UserAddressDto): Promise<UserAddress> {
    const query = `INSERT INTO user_addresses (${Object.keys(
      userAddress,
    )}) VALUES (${Object.keys(userAddress).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;

    const [saveUserAddress] = await this.database.query<UserAddress>(
      query,
      Object.values(userAddress),
    );
    return saveUserAddress;
  }

  async getMyTools(
    args: GetMyToolsArgs,
    userId: string,
  ): Promise<{
    toolkits: Toolkit[];
    total: number;
  }> {
    const { page, limit } = args;
    const offset = (page - 1) * limit;

    const commonQuery = `
          FROM tool_kits  WHERE
           tool_kits.id IN (
              SELECT DISTINCT user_schedule_sessions.tool_kit_id
              FROM user_schedule_sessions
               WHERE user_schedule_sessions.user_id = $1
            ) `;

    const queryWithPagination = ` SELECT tool_kits.*  ${commonQuery} 
    ORDER BY tool_kits.created_at DESC 
    LIMIT $2 OFFSET $3`;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(tool_kits.*),'0') AS INTEGER) AS total ${commonQuery}`;

    const [toolkits, [{ total }]] = await Promise.all([
      this.database.query<Toolkit>(queryWithPagination, [
        userId,
        limit,
        offset,
      ]),
      this.database.query<{ total: number }>(queryWithoutPagination, [userId]),
    ]);
    return { toolkits, total };
  }

  async updateShopItemPurchase(
    purchaseId: string,
    updates: UpdateShopitemPurchase,
  ): Promise<ShopitemPurchase> {
    const parameters = [...Object.values(updates), purchaseId];
    const query =
      'UPDATE shop_item_purchases SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;

    const [shopItemPurchase] = await this.database.query<ShopitemPurchase>(
      query,
      parameters,
    );
    return shopItemPurchase;
  }
  async saveUserOnboarding(userId: string): Promise<Onboarding> {
    const query = `INSERT INTO onboardings(
      "userId",
      screen,
      is_completed)
      values($1,$2,$3) RETURNING *`;
    const [userOnBoarding] = await this.database.query<Onboarding>(query, [
      userId,
      OnboardingScreen.user_name, //we using user_name for full name screen.
      false,
    ]);
    return userOnBoarding;
  }

  async saveUserStatusInfo(input: AddUserStatusInfo): Promise<UserStatusInfo> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_status_info (${columns}) VALUES (${placeholders}) RETURNING *`;
    const [userStatusInfo] = await this.database.query<UserStatusInfo>(
      query,
      values,
    );
    return userStatusInfo;
  }

  async updateOnboardingScreen(
    userId: string,
    screen: OnboardingScreen,
  ): Promise<Onboarding> {
    const query = `UPDATE onboardings SET screen=$1 WHERE "userId"= $2 RETURNING *`;
    const [updatedUserOnboarding] = await this.database.query<Onboarding>(
      query,
      [screen, userId],
    );
    return updatedUserOnboarding;
  }

  async saveUserFriendRequest(
    userFriendRequest: InsertUserFriendRequest,
  ): Promise<UserFriendRequest> {
    const keys = Object.keys(userFriendRequest);
    const values = Object.values(userFriendRequest);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_friend_requests (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [saveUserFriendRequest] =
      await this.database.query<UserFriendRequest>(query, values);
    return saveUserFriendRequest;
  }

  public async getUserFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<UserFriendRequest> {
    const query = `SELECT * FROM user_friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status =$3 AND is_deleted = false`;
    const [userFriendRequest] = await this.database.query<UserFriendRequest>(
      query,
      [userId, friendId, ChannelInvitationStatus.PENDING],
    );
    return userFriendRequest;
  }

  public async getUserFriendRequestById(
    requestId: string,
  ): Promise<UserFriendRequest> {
    const query = `SELECT * FROM user_friend_requests WHERE id = $1 AND status = $2 AND is_deleted = false`;
    const [userFriendRequest] = await this.database.query<UserFriendRequest>(
      query,
      [requestId, ChannelInvitationStatus.PENDING],
    );
    return userFriendRequest;
  }

  async updateUserFriendRequestStatus(
    requestId: string,
    status: ChannelInvitationStatus,
  ): Promise<UserFriendRequest> {
    const query = `UPDATE user_friend_requests SET status=$1 WHERE id = $2 RETURNING *;`;
    const updateValues = [status, requestId];
    const [updatedFriendRequest] = await this.database.query<UserFriendRequest>(
      query,
      updateValues,
    );
    return updatedFriendRequest;
  }

  async updateUserNotification(
    invitationId: string,
  ): Promise<UserNotification> {
    const query =
      'UPDATE user_notifications SET is_read=$1 WHERE invitation_id = $2';
    const [notification] = await this.database.query<UserNotification>(query, [
      true,
      invitationId,
    ]);
    return notification;
  }

  async removeUserFriendRequest(requestId: string): Promise<UserFriendRequest> {
    const query =
      'UPDATE user_friend_requests SET is_deleted = true WHERE id = $1 RETURNING *; ';

    const [removedUserFriendRequest] =
      await this.database.query<UserFriendRequest>(query, [requestId]);
    return removedUserFriendRequest;
  }

  async getUserFriendRequests(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ friendRequests: FriendRequestsWithUser[]; total: number }> {
    const offset = (page - 1) * limit;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total 
    FROM user_friend_requests
    LEFT JOIN users ON users.id=user_friend_requests.receiver_id
    WHERE user_friend_requests.sender_id = $1 
    AND user_friend_requests.is_deleted = false 
    AND user_friend_requests.status = $2`;
    const query = `SELECT user_friend_requests.*,ROW_TO_JSON(users.*) AS user
    FROM user_friend_requests
    LEFT JOIN users ON users.id=user_friend_requests.receiver_id
    WHERE user_friend_requests.sender_id = $1  
    AND user_friend_requests.is_deleted = false 
    AND user_friend_requests.status = $2
    ORDER BY user_friend_requests.created_at DESC 
    LIMIT $3 OFFSET $4`;
    const [[{ total }], friendRequests] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        userId,
        ChannelInvitationStatus.PENDING,
      ]),
      this.database.query<FriendRequestsWithUser>(query, [
        userId,
        ChannelInvitationStatus.PENDING,
        limit,
        offset,
      ]),
    ]);
    return { friendRequests, total };
  }

  async getFriends(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ friends: UserFriendData[]; total: number }> {
    const offset = (page - 1) * limit;

    const commonQuery = `
      FROM 
        user_friends
      JOIN users ON users.id=user_friends.friend_id
        WHERE user_friends.user_id = $1
      AND user_friends.friend_id NOT IN 
      (
        SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id=$1
      )`;

    const searchQuery = `AND (first_name ILIKE $2 OR last_name ILIKE $2 OR user_name ILIKE $2)`;

    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total ${commonQuery} ${
      search ? `${searchQuery}` : ` `
    }`;

    const params: unknown[] = [userId];

    const query = `SELECT  
        users.id,
        users.avatar_image_name,
        users.user_name,
        users.first_name,
        users.last_name,
        users.avatar_type,
        users.file_path
        ${commonQuery}
        ${
          search
            ? `${searchQuery} ORDER BY user_friends.created_at DESC LIMIT $3 OFFSET $4`
            : `ORDER BY user_friends.created_at DESC LIMIT $2 OFFSET $3`
        }
        `;

    if (search) {
      params.push(`%${search}%`);
    }

    const [[{ total }], friends] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, params),
      this.database.query<UserFriendData>(query, [...params, limit, offset]),
    ]);

    return { friends, total };
  }

  async getPatientInvitation(email: string): Promise<PatientInvitation | null> {
    const query = `SELECT * FROM patient_invitations WHERE email = $1 AND status = $2 ;`;
    const [patientInvitation] = await this.database.query<PatientInvitation>(
      query,
      [email, PaitentInvitationStatus.PENDING],
    );
    return patientInvitation;
  }

  async updatePatientInvitationStatus(
    invitation_id: string,
    email: string,
    status: PaitentInvitationStatus,
  ): Promise<PatientInvitation> {
    const query = `UPDATE patient_invitations SET status = $1 WHERE id = $2 AND email = $3 RETURNING *;`;
    const [invitation] = await this.database.query<PatientInvitation>(query, [
      status,
      invitation_id,
      email,
    ]);

    return invitation;
  }

  async getUserAddress(userId: string): Promise<UserAddress> {
    const query = `SELECT * FROM user_addresses WHERE user_addresses.user_id = $1;`;
    const [userAddress] = await this.database.query<UserAddress>(query, [
      userId,
    ]);
    return userAddress;
  }

  async getUserTreatment(userId: string): Promise<UserTreatmentProfileDto> {
    const query = `SELECT
    users.id,
    users.first_name,
    users.last_name,
    users.date_of_birth,
    users.email,
    users.user_name,
    treatments.id AS treatment_id,
    treatment_options.title,
    treatment_options.translations
  FROM
    users
    LEFT JOIN treatments ON users.id = treatments.user_id
    LEFT JOIN treatment_options ON treatments.option_id = treatment_options.id
  WHERE
    users.id = $1 
    AND treatments.is_deleted = $2;`;
    const [userTreatmentProfile] =
      await this.database.query<UserTreatmentProfileDto>(query, [
        userId,
        false,
      ]);
    return userTreatmentProfile;
  }

  async getOauthUserByEmail(email: string): Promise<OauthUser> {
    const query = `SELECT * FROM oauth_users where email ILIKE $1`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [email]);
    return oauthUser;
  }

  async updateOauthUserRegistrationStatus(
    oauthUserId: string,
    status: UserRegistrationStatus,
  ): Promise<OauthUser> {
    const query = `UPDATE oauth_users SET status = $1  WHERE id = $2 RETURNING *; `;
    const [oauthUser] = await this.database.query<OauthUser>(query, [
      status,
      oauthUserId,
    ]);
    return oauthUser;
  }

  async updateUser(userId: string, updates: UpdateUserDto): Promise<Users> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE users SET ${setFields} WHERE id = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, userId];

    const [user] = await this.database.query<Users>(query, updateValues);
    return user;
  }

  async getUserWithOrganisation(userId: string): Promise<UserWithOrganisation> {
    const query = `SELECT
    users.*,
    (
      SELECT
        ROW_TO_JSON(organisations.*)
      FROM
        organisations
      WHERE
        organisations.id = users.organization_id
    ) AS organisation
  FROM
    users
  WHERE
    users.id = $1; `;
    const [userWithOrganisation] =
      await this.database.query<UserWithOrganisation>(query, [userId]);
    return userWithOrganisation;
  }

  async getOauthUserByEmailAndStatus(
    email: string,
    status: UserRegistrationStatus,
  ): Promise<OauthUser> {
    const query = `SELECT * FROM oauth_users WHERE email ILIKE $1 AND status=$2`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [
      email,
      status,
    ]);
    return oauthUser;
  }

  async getUserByIdAndRole(userId: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id = $1 AND role= $2`;
    const [user] = await this.database.query<Users>(query, [
      userId,
      UserRoles.USER,
    ]);
    return user;
  }
}
