import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Schedule } from '../../schedules/schedules.model';
import { Toolkit } from '../../toolkits/toolkits.model';
import {
  ButtonPage,
  DailyRobots,
  RobotEntity,
  RobotPageType,
  TopTipOfTheDayRobotEntity,
} from '../entities/robot.entity';
import { Goal } from '../../goals/goals.model';
import { FlowChartRobot } from '../entities/flow-chart-robot.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class GetRobotsResponseDto {
  @Field(() => [DailyRobots], { nullable: 'items' })
  robots: DailyRobots[];
}

@ObjectType()
export class Robot extends RobotEntity {
  @Field(() => Toolkit, { nullable: true })
  toolkit?: Toolkit;

  @Field(() => String, { nullable: true })
  notification_id?: string;
}

@ObjectType()
export class TopTipOfTheDayRobot extends TopTipOfTheDayRobotEntity {
  @Field(() => Toolkit, { nullable: true })
  toolkit?: Toolkit;
}

@ArgsType()
export class GetRobotsArgsDto {
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  date: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEnum(RobotPageType, { message: i18nValidationMessage('is_enum') })
  @Field(() => RobotPageType, { nullable: true })
  page?: RobotPageType;
}

export const robotUserSessionLogCacheKey = `robots:user_session_logs:`;
export const robotUserCacheKey = `robots:users:`;
export const robotOnboardingRobotLogHashKey = (
  page?: RobotPageType,
): string => {
  const key = 'robots:onboardings:robot_logs';
  return page ? `${key}:${page}` : key;
};
export const robotToolkitCacheKey = 'robots:tool_kits:';

export function getRobotUserSessionLogCacheKey(
  userId: string,
  date: string,
  page?: RobotPageType,
): string {
  let dateKey = date;
  if (date.includes('T')) {
    dateKey = date.split('T')[0];
  }
  const pageKey = page ? `_${page}` : '';
  return `${robotUserSessionLogCacheKey}${userId}_${dateKey}${pageKey}`;
}

export const robotNavigationDeepLinks = new Map<ButtonPage, string>([
  [ButtonPage.CHECK_INS, `/my_health_tab_selected/0`],
  [
    ButtonPage.PROFILE,
    `/community_tab_selected/0/profile_subroute_from_community/USER_ID`,
  ],
  [
    ButtonPage.TOOLKIT_CATEGORY,
    `/dashboard/toolkit_home_subroute_from_dashboard`,
  ],
  [
    ButtonPage.REWARD_HISTORY,
    `/score_tab_selected/0/reward_history_from_score`,
  ],
  [ButtonPage.BONUSES, `/score_tab_selected/0/bonuses_from_score`],

  [
    ButtonPage.EMERGENCY_RESOURCES,
    `/my_health_tab_selected/0/settings_subroute_from_me/USER_ID/information_from_settings/emergency_resource_from_information?id&toolKitType=EMERGENCY_RESOURCES`,
  ],
  [
    ButtonPage.COMMUNITY_RULES,
    `/my_health_tab_selected/1/settings_subroute_from_me/USER_ID/information_from_settings/community_rules?id&toolKitType=COMMUNITY_RULES&from=community_rules`,
  ],
  [ButtonPage.FAQ, `/faq`],
  [ButtonPage.SERVICES, `/community_tab_selected/1`],
  [
    ButtonPage.SERVICE_DETAIL,
    `/service_company/COMPANY_NAME/SERVICE_ID/SERVICE_COMPANY_INFO`,
  ],
  [ButtonPage.OFFER_DETAIL, `/service_company_offer/OFFER_ID`],
  [ButtonPage.SCORE, `/score_tab_selected/0`],
  [
    ButtonPage.TOOL_KIT,
    `/dashboard/toolkit_home_subroute_from_dashboard/toolkit_category_subroute_from_toolkit_category/TOOLKIT_CATEGORY/tool_profile_subroute_from_toolkit_category/TOOLKIT_ID/TOOLKIT_TYPE`,
  ],
  [ButtonPage.CHALLENGE, `/challenge_ranking?challengeId=CHALLENGE_ID`],
  [ButtonPage.CHANNEL, `/community_tab_selected/0`],
  [ButtonPage.GOALS, `/my_health_tab_selected/0`],
  [ButtonPage.MY_BALANCE, `/score_tab_selected/0`],
  [ButtonPage.MY_INSIGHTS, `/my_health_tab_selected/0`],
  [
    ButtonPage.ACTIVITY_INSIGHTS,
    `/my_health_tab_selected/0/activity_insight_subroute`,
  ],
  [
    ButtonPage.SLEEP_INSIGHTS,
    `/my_health_tab_selected/0/sleep_insight_subroute`,
  ],
  [
    ButtonPage.MOOD_CHECK,
    `/my_health_tab_selected/0/mood_insight_subroute/insights`,
  ],
  [
    ButtonPage.SETTINGS,
    `/my_health_tab_selected/0/settings_subroute_from_me/USER_ID`,
  ],
  [
    ButtonPage.MOOD_INSIGHTS,
    '/my_health_tab_selected/0/mood_insight_subroute/insights',
  ],
  [ButtonPage.MY_HOSPITAL, '/my_health_tab_selected/1'],
  [ButtonPage.TREATMENT_TIMELINE, '/dashboard/timeline_tab_from_dashboard/0'],
]);

export class UserScheduleWithToolkit {
  schedule: Schedule;
  toolkit: Toolkit;
}

export class ReminderScheduleToolkit extends UserScheduleWithToolkit {}

export class ToolkitAndGoal {
  toolkit: Toolkit;
  goal: Goal;
}

export const robotButtonsThatRequireUserIdForDeeplink = [
  ButtonPage.PROFILE,
  ButtonPage.EMERGENCY_RESOURCES,
  ButtonPage.COMMUNITY_RULES,
  ButtonPage.SETTINGS,
];

export const robotButtonsThatRequireDataForDeepLink = [
  ButtonPage.SERVICE_DETAIL,
  ButtonPage.OFFER_DETAIL,
  ButtonPage.TOOL_KIT,
  ButtonPage.CHALLENGE,
  ButtonPage.PROFILE,
  ButtonPage.EMERGENCY_RESOURCES,
  ButtonPage.COMMUNITY_RULES,
  ButtonPage.SETTINGS,
];

export class UserFlowChartRobot extends FlowChartRobot {
  is_completed: boolean;
}
