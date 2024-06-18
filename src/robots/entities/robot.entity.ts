import {
  createUnionType,
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Robot, TopTipOfTheDayRobot } from '../dto/robots.dto';
import { FlowChartRobot } from './flow-chart-robot.entity';
import { Translation } from '@utils/utils.dto';

export enum RobotType {
  ONBOARDING = 'onboarding',
  CHECKIN = 'check_in',
  TOOL_REMINDER = 'tool_reminder',
  EMPTY_AGENDA = 'empty_agenda',
  EMPTY_TOOLKIT = 'empty_tool_kit',
  GREETING = 'greeting',
  TIP = 'TIP',
  WELCOME_BACK = 'WELCOME_BACK',
  HAVE_NICE_DAY = 'HAVE_NICE_DAY',
  FLOW_CHART = 'FLOW_CHART',
  TREATMENT_TIMELINE = 'TREATMENT_TIMELINE',
}

export enum RobotTitleType {
  greeting = 'greeting',
  generice = 'generic',
}

export enum RobotButtonAction {
  close = 'close',
  next = 'next',
  navigate = 'navigate',
}

export enum ButtonPage {
  REWARD_HISTORY = 'REWARD_HISTORY',
  BONUSES = 'BONUSES',
  PROFILE = 'PROFILE',
  CHECK_INS = 'CHECK_INS',
  TOOLKIT_CATEGORY = 'TOOLKIT_CATEGORY',
  EMERGENCY_RESOURCES = 'EMERGENCY_RESOURCES',
  COMMUNITY_RULES = 'COMMUNITY_RULES',
  FAQ = 'FAQ',
  SERVICES = 'SERVICES',
  SERVICE_DETAIL = 'SERVICE_DETAIL',
  OFFER_DETAIL = 'OFFER_DETAIL',
  TOOL_KIT = 'TOOL_KIT',
  CHALLENGE = 'CHALLENGE',
  CHANNEL = 'CHANNEL',
  GOALS = 'GOALS',
  SCORE = 'SCORE',
  MY_HOSPITAL = 'MY_HOSPITAL',
  MY_BALANCE = 'MY_BALANCE',
  MOOD_CHECK = 'MOOD_CHECK',
  SETTINGS = 'SETTINGS',
  MY_INSIGHTS = 'MY_INSIGHTS',
  ACTIVITY_INSIGHTS = 'ACTIVITY_INSIGHTS',
  SLEEP_INSIGHTS = 'SLEEP_INSIGHTS',
  MOOD_INSIGHTS = 'MOOD_INSIGHTS',
  TREATMENT_TIMELINE = 'TREATMENT_TIMELINE',
}
export enum RobotPageType {
  DASHBOARD = 'DASHBOARD',
  COMMUNITY = 'COMMUNITY',
  SCORE = 'SCORE',
  MY_HEALTH = 'MY_HEALTH',
  PROFILE = 'PROFILE',
  SERVICES = 'SERVICES',
  MY_REWARDS = 'MY_REWARDS',
  MY_HOSPITAL = 'MY_HOSPITAL',
}

registerEnumType(RobotButtonAction, { name: 'RobotButtonAction' });
registerEnumType(RobotTitleType, { name: 'RobotTitleType' });
registerEnumType(RobotType, { name: 'RobotType' });
registerEnumType(RobotPageType, { name: 'RobotPageType' });

@ObjectType()
class ButtonLabelTranslation {
  @Field(() => String)
  label: string;
}
@ObjectType()
class RobotButtonLabelTranslation {
  @Field(() => ButtonLabelTranslation)
  en: ButtonLabelTranslation;

  @Field(() => ButtonLabelTranslation)
  nl: ButtonLabelTranslation;
}
@ObjectType()
export class RobotButton {
  label: string;
  action: RobotButtonAction;
  page?: string;
  tool_kit_id?: string;
  service_id?: string;
  offer_id?: string;
  challenge_id?: string;
  translations?: RobotButtonLabelTranslation;
}

@ObjectType()
export class RobotEntity {
  id: string;
  body: string;
  title_type: RobotTitleType;
  robot_image_file_path: string;
  robot_image_id: string;
  robot_image_url: string;
  thumbnail_file_path?: string;
  thumbnail_id?: string;
  thumbnail_url?: string;
  title: string;
  type: RobotType;
  video_file_path?: string;
  video_id?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  @Field(() => [RobotButton])
  buttons: RobotButton[];
  suggested_toolkit_id?: string;
  page?: RobotPageType;
  sequence?: number;
  @HideField()
  translations?: Translation;
}

export enum TipTopRobotType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

registerEnumType(TipTopRobotType, { name: 'TipTopRobotType' });

@ObjectType()
export class TopTipOfTheDayRobotEntity {
  id: string;
  title: string;
  body: string;
  tip_type: TipTopRobotType;
  image_id?: string;
  image_url?: string;
  file_path?: string;
  video_id?: string;
  video_url?: string;
  video_path?: string;
  thumbnail_url?: string;
  thumbnail_id?: string;
  thumbnail_path?: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  logo_url?: string;
  logo_id?: string;
  logo_path?: string;
  @Field(() => GraphQLISODateTime)
  date: string;
  @Field(() => [RobotButton])
  buttons: RobotButton[];
  type: RobotType;
  suggested_toolkit_id?: string;
  page?: RobotPageType;
  @HideField()
  translations?: Translation;
}

@ObjectType()
export class HaveANiceDayRobot {
  id: string;
  title: string;
  body: string;
  robot_image_url: string;
  robot_image_id: string;
  robot_image_file_path: string;
  buttons: RobotButton[];
  created_at: string;
  updated_at: string;
  @HideField()
  translations?: Translation;
}

export const DailyRobots = createUnionType({
  name: 'DailyRobots',
  types: () => [Robot, TopTipOfTheDayRobot, FlowChartRobot] as const,
  resolveType: (value) => {
    if ('title_type' in value) {
      return Robot;
    }
    if ('tip_type' in value) {
      return TopTipOfTheDayRobot;
    }
    if ('type' in value && value.type === RobotType.FLOW_CHART) {
      return FlowChartRobot;
    }
    return Robot;
  },
});

export type DailyRobots = Robot | TopTipOfTheDayRobot | FlowChartRobot;
