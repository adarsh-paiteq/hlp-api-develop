import {
  Schedule,
  ScheduleWithToolkit,
  ToolKitByToolKit,
} from '../schedules/schedules.dto';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import {
  MedicationToolkitTypeDto,
  MedicationGoalDto,
  AlcoholToolkitTypeDto,
  AlcoholOptionsDto,
  AlcoholGoalDto,
  SportToolkitTypeDto,
  SportOptionsDto,
  SportGoalDto,
  StepsToolkitTypeDto,
  StepsOptionsDto,
  StepsGoalDto,
  SleepCheckToolkitTypeDto,
  SleepOptionsDto,
  SleepGoalDto,
  WeightToolkitTypeDto,
  WeightOptionsDto,
  WeightGoalDto,
  BloodPressureToolkitTypeDto,
  HeartRateToolkitTypeDto,
  HeartEcgToolkitTypeDto,
  PodcastToolkitTypeDto,
  VideoToolkitTypeDto,
  RunningToolkitTypeDto,
  ActivityToolkitTypeDto,
  MeditationToolkitTypeDto,
  toolkitSelectedOptionFragments,
  toolkitGraphFields,
  toolkitDatePartFields,
  PepareGraphData,
  toolkitGraphType,
  GraphQueryResponse,
  toolkitRangeGraphMinFields,
  toolkitRangeGraphMaxFields,
  ToolkitAnswerAndSchedule,
  ToolkitAndGoal,
  toolkitSessionFields,
} from './toolkit.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ToolKit } from '../rewards/rewards.dto';
import {
  Activities,
  AlchoholTypes,
  AnswerHistory,
  AnswersHistoryCalenderQueryResult,
  AnswersHistoryRewards,
  AnswersHistoryStreak,
  GraphAverageLabels,
  GraphAvgResponse,
  GraphType,
  HabitToolkitAnswers,
  Intensities,
  toolkitAnswersValueFieldNames,
  toolkitAnswerTables,
  ToolkitCategory,
  ToolkitChallenge,
  ToolkitOptions,
  toolkitOptionsFieldNames,
  toolkitOptionsSelectedFieldNames,
  toolkitSelectedOptionTables,
  toolkitOptionsTableNames,
  ToolkitSelectedOptions,
  ToolkitType,
  Toolkit,
  EpisodesToolkitAnswers,
  ToolkitAnswers,
} from './toolkits.model';
import { scheduleFragment } from '../schedules/schedules.repo';
import {
  alcoholToolkitOptionSelectedFragment,
  medicationToolkitInfoPlannedFragment,
  sleepToolkitOptionSelectedFragment,
  sportsToolkitOptionSelectedFragment,
  stepToolkitOptionSelectedFragment,
  toolkitFragment,
  weightToolkitOptionSelectedFragment,
} from './toolkits.fragments';
import { Database } from '../core/modules/database/database.service';
import ms from 'ms';
import { UserGoalLevels } from '../goals/goals.model';
import { Schedule as ScheduleNew } from '../schedules/schedules.model';
import { Checkin } from '../checkins/entities/check-ins.entity';
import { GoalLevelWithStatus } from '../goals/dto/goal-levels.dto';
import { Goal } from '../goals/entities/goal.entity';
import { UserMembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { MoodCheckCategoryAndSubCategory } from './dto/get-toolkit-answer.dto';
import { UserFormAnswer } from '../forms/entities/user-form-answer.entity';
import {
  EpisodeFormWithStatus,
  EpisodeToolAnswer,
  EpisodeToolAnswerTable,
  EpisodeVideoWithStatus,
} from './dto/get-episode-toolkit-details.dto';
import { PlayedAudioToolkitAudioFile } from './entities/played-audio-toolkit-audio-file.entity';
import { SavePlayedAudioToolkitAudioFileInput } from './dto/save-played-audio-toolkit-audio-file.dto';
import { AudioToolKitFile } from './entities/audio-toolkit-files.entity';
import { AudioToolkitAnswer } from './entities/audio-toolkit-answer.entity';
import { AudioToolkitFileWithStatus } from './dto/get-audio-toolkit-details.dto';
import { UserTookit } from './entities/user-toolkits.entity';
import { InsertUserToolkitAnswerInput } from './dto/save-user-toolkit-answer.dto';
import { UserTookitAnswer } from './entities/user-toolkit-answers.entity';
import {
  ScheduleEntity,
  ScheduleFor,
} from '@schedules/entities/schedule.entity';
import {
  FormWithStatus,
  UserAppointmentDetails,
} from './dto/get-appointment-details.dto';
import { Users } from '@users/users.model';
import {
  GetAppointmentSchedules,
  InsertUserAppointmentAnswerInput,
} from './dto/save-user-appointment-answer.dto';
import { UserAppointmentAnswerHistory } from './dto/get-appointment-history.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { GetFormToolkitDetails } from './dto/get-toolkit-form-details.dto';
import { SaveToolkitAnswerInput } from './dto/save-toolkit-answer.dto';
import { UserScheduleSession } from '@schedule-sessions/entities/user-schedule-sessions.entity';
import { GetAllToolkitsHistory } from './dto/get-toolkit-history.dto';
@Injectable()
export class ToolkitRepo {
  private readonly logger = new Logger(ToolkitRepo.name);
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getSleepCheckToolkitTypeByIdQuery() function
   * and this function used in @function getSleepToolkitData()
   * @deprecated
   */
  private readonly sleepCheckToolkitTypeFragment = gql`
    fragment sleepCheckToolkitType on tool_kits {
      id
      title
      short_description
      tool_kit_type
      tool_kit_hlp_reward_points
      challenges {
        id
      }
    }
  `;

  /**
   * This function is deprecated because it is used in this @function getHeartRateToolkitTypeByIdQuery() and this is not used in anywhere
   * Unused Code
   * @deprecated
   */
  private readonly heartRateToolkitTypeFragment = gql`
    fragment heartRateToolkitType on tool_kits {
      id
      title
      tool_kit_type
      max_heart_rate_in_bpm
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getBloodPressureToolkitTypeByIdQuery() function and
   *  this function used in @function getBloodPressureToolkitData()
   * @deprecated
   */
  private readonly bloodPressureToolkitTypeFragment = gql`
    fragment bloodPressureToolkitType on tool_kits {
      id
      title
      tool_kit_type
      max_blood_diastolic_value
      max_blood_systolic_value
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getAlcoholToolkitTypeByIdQuery() function
   * and this function used in @function getAlcoholToolkitData()
   * @deprecated
   */
  private readonly alcoholToolkitTypeFragment = gql`
    fragment alcoholToolkitType on tool_kits {
      id
      title
      short_description
      tool_kit_type
      image_url
      max_alcohol_intake
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getHeartEcgToolkitTypeByIdQuery() function
   * and this function used in @function getHeartEcgToolkitData()
   * @deprecated
   */
  private readonly heartEcgToolkitTypeFragment = gql`
    fragment heartEcgToolkitType on tool_kits {
      id
      title
      max_ecg_spm_value
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getMedicationToolkitTypeByIdQuery() function
   * and this function used in @function getMedicationToolkitData()
   * @deprecated
   */
  private readonly medicationToolkitTypeFragment = gql`
    fragment medicationToolkitType on tool_kits {
      id
      title
      tool_kit_type
      max_medication_per_day_value
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getPodcastToolkitTypeByIdQuery() function
   * and this function used in @function getPodcastToolkitData()
   * @deprecated
   */
  private readonly podcastToolkitTypeFragment = gql`
    fragment podcastToolkitType on tool_kits {
      id
      title
      tool_kit_type
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getRunningToolkitTypeByIdQuery() function
   *  and this function used in @function getRunningToolkitData()
   * @deprecated
   */
  private readonly runningToolkitTypeFragment = gql`
    fragment runningToolkitType on tool_kits {
      id
      title
      short_description
      tool_kit_type
      tool_kit_info
      description
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getSportToolkitTypeByIdQuery() function and
   * this function used in @function geSportToolkitData()
   * @deprecated
   */
  private readonly sportToolkitTypeFragment = gql`
    fragment sportToolkitType on tool_kits {
      id
      title
      short_description
      tool_kit_type
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getStepsToolkitTypeByIdQuery() function
   * and this function used in @function getStepsToolkitData()
   * @deprecated
   */
  private readonly stepsToolkitTypeFragment = gql`
    fragment stepsToolkitType on tool_kits {
      id
      title
      short_description
      tool_kit_type
      image_url
      max_foot_steps
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getVideoToolkitTypeQuery() function
   * and this function used in @function getVideoToolkitData()
   * @deprecated
   */
  private readonly videoToolkitTypeFragment = gql`
    fragment videoToolkitType on tool_kits {
      id
      title
      tool_kit_type
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function geWeightToolkitTypeByIdQuery() function
   *  and this function used in @function getWeightToolkitTypeByIdData()
   * @deprecated
   */
  private readonly weightToolkitTypeFragment = gql`
    fragment weightToolkitType on tool_kits {
      id
      title
      tool_kit_type
      max_weight_value
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getActivityToolkitTypeQuery() function
   * and this function used in @function getActivityToolkitTypeData()
   * @deprecated
   */
  private readonly activityToolkitTypeFragment = gql`
    fragment activityToolkitType on tool_kits {
      id
      title
      tool_kit_type
      activity_timer_value
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Fragment used in @function getMeditationToolkitTypeQuery() function
   * and this function used in @function getMeditationToolkitData()
   * @deprecated
   */
  private readonly meditationToolkitTypeFragment = gql`
    fragment meditationToolkitType on tool_kits {
      id
      title
      tool_kit_type
      tool_kit_hlp_reward_points
    }
  `;

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getSleepToolkitData()
   * @deprecated
   */
  public getSleepGoalQuery(): string {
    const query = gql`
      query sleepGoal($userId: uuid!, $toolkitId: uuid!, $scheduleId: uuid!) {
        sleep_tool_kit_option_selected_by_user(
          where: {
            user_id: { _eq: $userId }
            tool_kit_id: { _eq: $toolkitId }
            schedule_id: { _eq: $scheduleId }
          }
        ) {
          id
          sleep_tool_kit_option {
            id
            sleep_time
            tool_kit_id
          }
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getSleepToolkitData()
   * @deprecated
   */
  public getSleepOptionsQuery(): string {
    const query = gql`
      query sleepOptions($toolkitId: uuid!) {
        sleep_tool_kit_options(where: { tool_kit_id: { _eq: $toolkitId } }) {
          id
          sleep_time
          tool_kit_id
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getSleepToolkitData()
   * @deprecated
   */
  public getSleepCheckToolkitTypeByIdQuery(): string {
    const query = gql`
      query sleepCheckToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...sleepCheckToolkitType
        }
      }
      ${this.sleepCheckToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used
   * Unused code @function getHeartRateToolkitTypeByIdQuery()
   * @deprecated
   */
  public getHeartRateToolkitTypeByIdQuery(): string {
    const query = gql`
      query heartRateToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...heartRateToolkitType
        }
      }
      ${this.heartRateToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getBloodPressureToolkitData()
   * @deprecated
   */
  public getBloodPressureToolkitTypeByIdQuery(): string {
    const query = gql`
      query bloodPressureToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...bloodPressureToolkitType
        }
      }
      ${this.bloodPressureToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getAlcoholToolkitData()
   * @deprecated
   */
  public getAlcoholGoalQuery(): string {
    const query = gql`
      query alcoholGoal($userId: uuid!, $toolkitId: uuid!, $scheduleId: uuid!) {
        alcohol_tool_kit_option_selected_by_user(
          where: {
            user_id: { _eq: $userId }
            tool_kit_id: { _eq: $toolkitId }
            schedule_id: { _eq: $scheduleId }
          }
        ) {
          id
          alcohol_tool_kit_option {
            id
            no_of_glasses
          }
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getAlcoholToolkitData()
   * @deprecated
   */
  public getAlcoholOptionsQuery(): string {
    const query = gql`
      query alcoholOptions($toolkitId: uuid!) {
        alcohol_tool_kit_options(where: { tool_kit_id: { _eq: $toolkitId } }) {
          id
          no_of_glasses
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used because @function getAlcoholTypeQuery() not used in anywhere
   * @deprecated
   */
  public getAlcoholTypeQuery(): string {
    const query = gql`
      query alcoholType {
        alchohol_types {
          emoji
          id
          title
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getAlcoholToolkitData()
   * @deprecated
   */
  public getAlcoholToolkitTypeByIdQuery(): string {
    const query = gql`
      query alcoholToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...alcoholToolkitType
        }
      }
      ${this.alcoholToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used because @function getScheduleDataQuery() not used in anywhere
   * @deprecated
   */
  public getScheduleDataQuery(): string {
    const query = gql`
      query scheduleData($scheduleId: uuid!) {
        schedules(where: { id: { _eq: $scheduleId } }) {
          id
          schedule_type
          repeat_per_day
          show_reminder
          repeat_per_month
          start_date
          schedule_for
          schedule_days
          schedule_reminders {
            id
            reminder_time
          }
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getHeartRateToolkitData() and @function getHeartEcgToolkitData()
   * @deprecated
   */
  public getHeartEcgToolkitTypeByIdQuery(): string {
    const query = gql`
      query heartEcgToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...heartEcgToolkitType
        }
      }
      ${this.heartEcgToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getMedicationToolkitData()
   * @deprecated
   */
  public getMedicationGoalQuery(): string {
    const query = gql`
      query medicationGoal(
        $userId: uuid!
        $toolkitId: uuid!
        $scheduleId: uuid!
      ) {
        medication_tool_kit_info_planned_by_user(
          where: {
            user_id: { _eq: $userId }
            tool_kit_id: { _eq: $toolkitId }
            schedule_id: { _eq: $scheduleId }
          }
        ) {
          doses
          id
          instructions
          medication
          stock
          tool_kit_id
          user_id
          schedule_id
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getMedicationToolkitData()
   * @deprecated
   */
  public getMedicationToolkitTypeByIdQuery(): string {
    const query = gql`
      query medicationToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...medicationToolkitType
        }
      }
      ${this.medicationToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getPodcastToolkitData()
   * @deprecated
   */
  public getPodcastToolkitTypeByIdQuery(): string {
    const query = gql`
      query podcastToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...podcastToolkitType
        }
      }
      ${this.podcastToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRunningToolkitData()
   * @deprecated
   */
  public getRunningToolkitTypeByIdQuery(): string {
    const query = gql`
      query runningToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...runningToolkitType
        }
      }
      ${this.runningToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used because @function getActivityTypeQuery() not used in anywhere
   * @deprecated
   */
  public getActivityTypeQuery(): string {
    const query = gql`
      query activityType {
        activities {
          id
          title
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used because @function getIntensityTypeQuery() not used in anywhere
   * @deprecated
   */
  public getIntensityTypeQuery(): string {
    const query = gql`
      query intensityType {
        intensities {
          id
          title
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function geSportToolkitData()
   * @deprecated
   */
  public getSportGoalQuery(): string {
    const query = gql`
      query sportsGoal($userId: uuid!, $toolkitId: uuid!, $scheduleId: uuid!) {
        sports_tool_kit_option_selected_by_user(
          where: {
            user_id: { _eq: $userId }
            tool_kit_id: { _eq: $toolkitId }
            schedule_id: { _eq: $scheduleId }
          }
        ) {
          id
          sports_tool_kit_option {
            id
            time_spent
          }
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function geSportToolkitData()
   * @deprecated
   */
  public getSportOptionsQuery(): string {
    const query = gql`
      query sportOptions($toolkitId: uuid!) {
        sports_tool_kit_options(where: { tool_kit_id: { _eq: $toolkitId } }) {
          id
          time_spent
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function geSportToolkitData()
   * @deprecated
   */
  public getSportToolkitTypeByIdQuery(): string {
    const query = gql`
      query sportToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...sportToolkitType
        }
      }
      ${this.sportToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getStepsToolkitData()
   * @deprecated
   */
  public getStepsGoalQuery(): string {
    const query = gql`
      query stepsGoal($userId: uuid!, $toolkitId: uuid!, $scheduleId: uuid!) {
        step_tool_kit_option_selected_by_user(
          where: {
            user_id: { _eq: $userId }
            tool_kit_id: { _eq: $toolkitId }
            schedule_id: { _eq: $scheduleId }
          }
        ) {
          steps_tool_kit_option {
            id
            steps
          }
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getStepsToolkitData()
   * @deprecated
   */
  public getStepsOptionsQuery(): string {
    const query = gql`
      query stepsOptions($toolkitId: uuid!) {
        steps_tool_kit_options(where: { tool_kit_id: { _eq: $toolkitId } }) {
          id
          tool_kit_id
          steps
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getStepsToolkitData()
   * @deprecated
   */
  public getStepsToolkitTypeByIdQuery(): string {
    const query = gql`
      query stepsToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...stepsToolkitType
        }
      }
      ${this.stepsToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getVideoToolkitData()
   * @deprecated
   */
  public getVideoToolkitTypeQuery(): string {
    const query = gql`
      query videoToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...videoToolkitType
        }
      }
      ${this.videoToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getWeightToolkitTypeByIdData()
   * @deprecated
   */
  public getWeightGoalQuery(): string {
    const query = gql`
      query weightGoal($userId: uuid!, $toolkitId: uuid!, $scheduleId: uuid!) {
        weight_tool_kit_option_selected_by_user(
          where: {
            user_id: { _eq: $userId }
            tool_kit_id: { _eq: $toolkitId }
            schedule_id: { _eq: $scheduleId }
          }
        ) {
          id
          weight
          weight_tool_kit_options {
            id
            maximum_angle
            starting_angle
            tool_kit_id
          }
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getWeightToolkitTypeByIdData()
   * @deprecated
   */
  public getWeightOptionsQuery(): string {
    const query = gql`
      query weightOptions($toolkitId: uuid!) {
        weight_tool_kit_options(where: { tool_kit_id: { _eq: $toolkitId } }) {
          id
          maximum_angle
          starting_angle
          tool_kit_id
        }
      }
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getWeightToolkitTypeByIdData()
   * @deprecated
   */
  public geWeightToolkitTypeByIdQuery(): string {
    const query = gql`
      query weightToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...weightToolkitType
        }
      }
      ${this.weightToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getActivityToolkitTypeData()
   * @deprecated
   */
  public getActivityToolkitTypeQuery(): string {
    const query = gql`
      query activityToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...activityToolkitType
        }
      }
      ${this.activityToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getMeditationToolkitData()
   * @description
   */
  public getMeditationToolkitTypeQuery(): string {
    const query = gql`
      query meditationToolkitTypeById($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...meditationToolkitType
        }
      }
      ${this.meditationToolkitTypeFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getMedicationToolkitData(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<{
    medication_tool_kit: MedicationToolkitTypeDto[];
    medication_tool_kit_option_selected_by_user: MedicationGoalDto[];
  }> {
    const medicationToolkitTypeByIdQuery =
      this.getMedicationToolkitTypeByIdQuery();
    const medicationGoalQuery = this.getMedicationGoalQuery();
    type result = [
      {
        data: { tool_kits: MedicationToolkitTypeDto[] };
      },
      {
        data: {
          medication_tool_kit_info_planned_by_user: MedicationGoalDto[];
        };
      },
    ];
    const [
      {
        data: { tool_kits: medication_tool_kit },
      },
      {
        data: {
          medication_tool_kit_info_planned_by_user:
            medication_tool_kit_option_selected_by_user,
        },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: medicationToolkitTypeByIdQuery,
        variables: { toolkitId },
      },
      {
        document: medicationGoalQuery,
        variables: { userId, toolkitId, scheduleId },
      },
    ]);
    return {
      medication_tool_kit,
      medication_tool_kit_option_selected_by_user,
    };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getAlcoholToolkitData(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<{
    alcohol_tool_kit: AlcoholToolkitTypeDto[];
    alcohol_tool_kit_options: AlcoholOptionsDto[];
    alcohol_tool_kit_option_selected_by_user: AlcoholGoalDto[];
  }> {
    const alcoholToolkitTypeByIdQuery = this.getAlcoholToolkitTypeByIdQuery();
    const alcoholOptionsQuery = this.getAlcoholOptionsQuery();
    const alcoholGoalQuery = this.getAlcoholGoalQuery();
    type result = [
      {
        data: { tool_kits: AlcoholToolkitTypeDto[] };
      },
      {
        data: { alcohol_tool_kit_options: AlcoholOptionsDto[] };
      },
      {
        data: {
          alcohol_tool_kit_option_selected_by_user: AlcoholGoalDto[];
        };
      },
    ];
    const [
      {
        data: { tool_kits: alcohol_tool_kit },
      },
      {
        data: { alcohol_tool_kit_options },
      },
      {
        data: { alcohol_tool_kit_option_selected_by_user },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: alcoholToolkitTypeByIdQuery,
        variables: { toolkitId },
      },
      {
        document: alcoholOptionsQuery,
        variables: { toolkitId },
      },
      {
        document: alcoholGoalQuery,
        variables: { userId, toolkitId, scheduleId },
      },
    ]);
    return {
      alcohol_tool_kit,
      alcohol_tool_kit_options,
      alcohol_tool_kit_option_selected_by_user,
    };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async geSportToolkitData(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<{
    sports_tool_kit: SportToolkitTypeDto[];
    sports_tool_kit_options: SportOptionsDto[];
    sports_tool_kit_option_selected_by_user: SportGoalDto[];
  }> {
    const sportToolkitTypeByIdQuery = this.getSportToolkitTypeByIdQuery();
    const sportOptionsQuery = this.getSportOptionsQuery();
    const sportGoalQuery = this.getSportGoalQuery();
    type result = [
      {
        data: { tool_kits: SportToolkitTypeDto[] };
      },
      {
        data: { sports_tool_kit_options: SportOptionsDto[] };
      },
      {
        data: { sports_tool_kit_option_selected_by_user: SportGoalDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: sports_tool_kit },
      },
      {
        data: { sports_tool_kit_options },
      },
      {
        data: { sports_tool_kit_option_selected_by_user },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: sportToolkitTypeByIdQuery,
        variables: { toolkitId },
      },
      {
        document: sportOptionsQuery,
        variables: { toolkitId },
      },
      {
        document: sportGoalQuery,
        variables: { userId, toolkitId, scheduleId },
      },
    ]);
    return {
      sports_tool_kit,
      sports_tool_kit_options,
      sports_tool_kit_option_selected_by_user,
    };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getStepsToolkitData(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<{
    steps_tool_kit: StepsToolkitTypeDto[];
    steps_tool_kit_options: StepsOptionsDto[];
    step_tool_kit_option_selected_by_user: StepsGoalDto[];
  }> {
    const stepsToolkitTypeByIdQuery = this.getStepsToolkitTypeByIdQuery();
    const stepsOptionsQuery = this.getStepsOptionsQuery();
    const stepsGoalQuery = this.getStepsGoalQuery();
    type result = [
      {
        data: { tool_kits: StepsToolkitTypeDto[] };
      },
      {
        data: { steps_tool_kit_options: StepsOptionsDto[] };
      },
      {
        data: { step_tool_kit_option_selected_by_user: StepsGoalDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: steps_tool_kit },
      },
      {
        data: { steps_tool_kit_options },
      },
      {
        data: { step_tool_kit_option_selected_by_user },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: stepsToolkitTypeByIdQuery,
        variables: { toolkitId },
      },
      {
        document: stepsOptionsQuery,
        variables: { toolkitId },
      },
      {
        document: stepsGoalQuery,
        variables: { userId, toolkitId, scheduleId },
      },
    ]);
    return {
      steps_tool_kit,
      steps_tool_kit_options,
      step_tool_kit_option_selected_by_user,
    };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getSleepToolkitData(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<{
    sleep_tool_kit: SleepCheckToolkitTypeDto[];
    sleep_tool_kit_options: SleepOptionsDto[];
    sleep_tool_kit_option_selected_by_user: SleepGoalDto[];
  }> {
    const sleepToolkitTypeByIdQuery = this.getSleepCheckToolkitTypeByIdQuery();
    const sleepOptionsQuery = this.getSleepOptionsQuery();
    const sleepGoalQuery = this.getSleepGoalQuery();
    type result = [
      {
        data: { tool_kits: SleepCheckToolkitTypeDto[] };
      },
      {
        data: { sleep_tool_kit_options: SleepOptionsDto[] };
      },
      {
        data: { sleep_tool_kit_option_selected_by_user: SleepGoalDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: sleep_tool_kit },
      },
      {
        data: { sleep_tool_kit_options },
      },
      {
        data: { sleep_tool_kit_option_selected_by_user },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: sleepToolkitTypeByIdQuery,
        variables: { toolkitId },
      },
      {
        document: sleepOptionsQuery,
        variables: { toolkitId },
      },
      {
        document: sleepGoalQuery,
        variables: { userId, toolkitId, scheduleId },
      },
    ]);
    return {
      sleep_tool_kit,
      sleep_tool_kit_options,
      sleep_tool_kit_option_selected_by_user,
    };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getWeightToolkitTypeByIdData(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<{
    weight_tool_kit: WeightToolkitTypeDto[];
    weight_tool_kit_options: WeightOptionsDto[];
    weight_tool_kit_option_selected_by_user: WeightGoalDto[];
  }> {
    const weightToolkitTypeByIdQuery = this.geWeightToolkitTypeByIdQuery();
    const weightOptionsQuery = this.getWeightOptionsQuery();
    const weightGoalQuery = this.getWeightGoalQuery();
    type result = [
      {
        data: { tool_kits: WeightToolkitTypeDto[] };
      },
      {
        data: { weight_tool_kit_options: WeightOptionsDto[] };
      },
      {
        data: { weight_tool_kit_option_selected_by_user: WeightGoalDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: weight_tool_kit },
      },
      {
        data: { weight_tool_kit_options },
      },
      {
        data: { weight_tool_kit_option_selected_by_user },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: weightToolkitTypeByIdQuery,
        variables: { toolkitId },
      },
      {
        document: weightOptionsQuery,
        variables: { toolkitId },
      },
      {
        document: weightGoalQuery,
        variables: { userId, toolkitId, scheduleId },
      },
    ]);
    return {
      weight_tool_kit,
      weight_tool_kit_options,
      weight_tool_kit_option_selected_by_user,
    };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getBloodPressureToolkitData(
    toolkitId: string,
  ): Promise<{ blood_pressure_tool_kit: BloodPressureToolkitTypeDto[] }> {
    const bloodPressureToolkitTypeQuery =
      this.getBloodPressureToolkitTypeByIdQuery();
    type result = [
      {
        data: { tool_kits: BloodPressureToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: blood_pressure_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: bloodPressureToolkitTypeQuery,
        variables: { toolkitId },
      },
    ]);
    return { blood_pressure_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getHeartRateToolkitData(
    toolkitId: string,
  ): Promise<{ heart_rate_tool_kit: HeartRateToolkitTypeDto[] }> {
    const heartRateToolkitTypeQuery = this.getHeartEcgToolkitTypeByIdQuery();
    type result = [
      {
        data: { tool_kits: HeartRateToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: heart_rate_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: heartRateToolkitTypeQuery,
        variables: { toolkitId },
      },
    ]);
    return { heart_rate_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getHeartEcgToolkitData(
    toolkitId: string,
  ): Promise<{ heart_ecg_tool_kit: HeartEcgToolkitTypeDto[] }> {
    const heartEcgToolkitTypeQuery = this.getHeartEcgToolkitTypeByIdQuery();
    type result = [
      {
        data: { tool_kits: HeartEcgToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: heart_ecg_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: heartEcgToolkitTypeQuery,
        variables: { toolkitId },
      },
    ]);
    return { heart_ecg_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getPodcastToolkitData(
    toolkitId: string,
  ): Promise<{ podcast_tool_kit: PodcastToolkitTypeDto[] }> {
    const podcastToolkitTypeQuery = this.getPodcastToolkitTypeByIdQuery();
    type result = [
      {
        data: { tool_kits: PodcastToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: podcast_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: podcastToolkitTypeQuery,
        variables: { toolkitId },
      },
    ]);
    return { podcast_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getActivityToolkitTypeData(
    toolkitId: string,
  ): Promise<{ activity_tool_kit: ActivityToolkitTypeDto[] }> {
    const activityToolkitTypeQuery = this.getActivityToolkitTypeQuery();
    type result = [
      {
        data: { tool_kits: ActivityToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: activity_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: activityToolkitTypeQuery,
        variables: { toolkitId },
      },
    ]);
    return { activity_tool_kit };
  }

  /**
   * This Repo  used in  SESSION_ADDED Listener in trophies module
   * and this  used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @description
   */
  async getMeditationToolkitData(
    toolkitId: string,
  ): Promise<{ meditation_tool_kit: MeditationToolkitTypeDto[] }> {
    const meditationToolkitTypeQuery = this.getMeditationToolkitTypeQuery();
    type result = [
      {
        data: { tool_kits: MeditationToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: meditation_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: meditationToolkitTypeQuery,
        variables: { toolkitId },
      },
    ]);
    return { meditation_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getVideoToolkitData(
    toolkitId: string,
  ): Promise<{ video_tool_kit: VideoToolkitTypeDto[] }> {
    const videoToolkitQuery = this.getVideoToolkitTypeQuery();
    type result = [
      {
        data: { tool_kits: VideoToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: video_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: videoToolkitQuery,
        variables: { toolkitId },
      },
    ]);
    return { video_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getRunningToolkitData(
    toolkitId: string,
  ): Promise<{ running_tool_kit: RunningToolkitTypeDto[] }> {
    const runningToolkitQuery = this.getRunningToolkitTypeByIdQuery();
    type result = [
      {
        data: { tool_kits: RunningToolkitTypeDto[] };
      },
    ];
    const [
      {
        data: { tool_kits: running_tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: runningToolkitQuery,
        variables: { toolkitId },
      },
    ]);
    return { running_tool_kit };
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getToolkit()
   * @deprecated
   */
  public getToolkitByIdQuery(): string {
    const query = gql`
      query ($toolkitId: uuid!) {
        tool_kits(where: { id: { _eq: $toolkitId } }) {
          ...toolkit
        }
      }
      ${toolkitFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used because @function getToolkitDataQuery() not used in anywhere
   * @deprecated
   */
  public getToolkitDataQuery(): string {
    const query = gql`
      query {
        tool_kits {
          ...toolkit
        }
      }
      ${toolkitFragment}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used.
   * Because Repo used in  @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
   * Function used in CheckIfUserHasJoinedChallenge Action and which is not used from app side(in app side they are using getToolkitDetails)
   * @deprecated
   */
  async getToolkit(
    toolkitId: string,
  ): Promise<{ tool_kit: ToolKitByToolKit[] }> {
    const toolkitByIdQuery = this.getToolkitByIdQuery();
    type result = [
      {
        data: { tool_kits: ToolKitByToolKit[] };
      },
    ];
    const [
      {
        data: { tool_kits: tool_kit },
      },
    ] = await this.client.batchRequests<result>([
      {
        document: toolkitByIdQuery,
        variables: { toolkitId },
      },
    ]);
    return { tool_kit };
  }

  /**
   * This function is deprecated and should not be used because it is used in @function getToolkitOptionsSelected() and  this function not used in anywhere
   * @deprecated
   */
  private getToolkitOptionsSelectedQuery(tableName: string): string {
    const query = gql`
    query($id:uuid!) {
     options:${tableName}(where:{schedule_id:{_eq:$id}}){
       ...${toolkitSelectedOptionFragments.get(tableName)}
     }
    }
    ${[
      medicationToolkitInfoPlannedFragment,
      stepToolkitOptionSelectedFragment,
      sportsToolkitOptionSelectedFragment,
      alcoholToolkitOptionSelectedFragment,
      weightToolkitOptionSelectedFragment,
      sleepToolkitOptionSelectedFragment,
    ]
      .map((fragment) => `${fragment}`)
      .join('')}
    `;
    return query;
  }

  /**
   * This function is deprecated and should not be used because @function getToolkitOptionsSelected() not used in anywhere
   * @deprecated
   */
  async getToolkitOptionsSelected(
    id: string,
    tableName: string,
  ): Promise<[ToolkitSelectedOptions]> {
    const query = this.getToolkitOptionsSelectedQuery(tableName);
    type response = { options: [ToolkitSelectedOptions] };
    const { options } = await this.client.request<response>(query, { id });
    return options;
  }

  /**
   *@deprecated It is used in @function getScheduleById()
   */
  private getScheduleByIdQuery(): string {
    const query = gql`
      query ($id: uuid!) {
        schedule: schedules_by_pk(id: $id) {
          ...schedule
        }
      }
      ${scheduleFragment}
    `;
    return query;
  }

  /**
   *@deprecated ts not migrated and used in @function savePlayedAudioToolkitAudioFile()
   * we can also used  @function getScheduleById()  in notification instead of this graphQL query
   */
  async getScheduleById(id: string): Promise<Schedule> {
    const query = this.getScheduleByIdQuery();
    type result = { schedule: Schedule };
    const { schedule } = await this.client.request<result>(query, { id });
    return schedule;
  }

  async getToolkitNew(id: string): Promise<ToolKit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [toolkit] = await this.database.query<ToolKit>(query, [id]);
    return toolkit;
  }

  async getToolkitOptionsNew(
    id: string,
    tableName: string,
  ): Promise<ToolkitOptions[]> {
    const query = `SELECT * FROM ${tableName} WHERE tool_kit_id=$1`;
    const response = await this.database.query<ToolkitOptions>(query, [id]);
    return response;
  }

  async getToolkitOptionsSelectedNew(
    id: string,
    tableName: string,
  ): Promise<ToolkitSelectedOptions[]> {
    const query = `SELECT * FROM ${tableName} WHERE schedule_id=$1`;
    const response = await this.database.query<ToolkitSelectedOptions>(query, [
      id,
    ]);
    return response;
  }

  async getScheduleByIdNew(id: string): Promise<ScheduleNew> {
    const query = `SELECT * FROM schedules WHERE id=$1`;
    const [schedule] = await this.database.query<ScheduleNew>(query, [id]);
    return schedule;
  }

  private getTableNameByToolkitType(toolkitType: ToolkitType): string {
    const tableName = toolkitAnswerTables.get(toolkitType);
    if (!tableName) {
      throw new NotFoundException(`Table name not found ${toolkitType}`);
    }
    return tableName;
  }

  private getBarGraphQuery(graphData: PepareGraphData): string {
    const { toolkitType, graphRange } = graphData;
    const tableName = this.getTableNameByToolkitType(toolkitType);
    const dataField = toolkitGraphFields.get(toolkitType) as string;
    const dateField = toolkitDatePartFields.get(graphRange) as string;
    const query = `SELECT SUM(${tableName}.${dataField}) AS total,
           EXTRACT(${dateField} FROM ${tableName}.session_date) AS label
           FROM ${tableName} WHERE user_id = $1 AND
           DATE(${tableName}.session_date) BETWEEN  DATE( $2 ) AND DATE( $3 )
           GROUP BY label
           ORDER BY label DESC`;
    return query;
  }

  private getRangeGraphQuery(graphData: PepareGraphData): string {
    const { toolkitType, graphRange } = graphData;
    const tableName = this.getTableNameByToolkitType(toolkitType);
    const start = toolkitRangeGraphMinFields.get(toolkitType) as string;
    const end = toolkitRangeGraphMaxFields.get(toolkitType) as string;
    const dateField = toolkitDatePartFields.get(graphRange) as string;
    const query = `SELECT MIN(${start}) as start, MAX(${end}) as end ,
            EXTRACT(${dateField} FROM ${tableName}.session_date) AS label
            FROM ${tableName} WHERE user_id = $1 AND
            DATE(${tableName}.session_date) BETWEEN  DATE( $2 ) AND DATE( $3 )
            GROUP BY label
            ORDER BY label DESC;`;
    return query;
  }

  async getToolkitDataForGraph(
    graphData: PepareGraphData,
  ): Promise<GraphQueryResponse[]> {
    const { userId, startDate, endDate, toolkitType } = graphData;
    let query;
    const graphType = toolkitGraphType.get(toolkitType);
    const queryParms = [userId, startDate, endDate];
    if (graphType === GraphType.BAR) {
      query = this.getBarGraphQuery(graphData);
    } else {
      query = this.getRangeGraphQuery(graphData);
    }
    const toolkitData = await this.database.query<GraphQueryResponse>(
      query,
      queryParms,
    );
    return toolkitData;
  }

  async getDayScatteredGraphData(
    graphData: PepareGraphData,
  ): Promise<GraphQueryResponse[]> {
    const { userId, startDate, endDate, toolkitType, graphRange } = graphData;
    const tableName = this.getTableNameByToolkitType(toolkitType);
    const dataField = toolkitGraphFields.get(toolkitType) as string;
    const sessionField = toolkitSessionFields.get(graphRange) as string;
    const query = `SELECT CONCAT(EXTRACT(HOUR FROM ${tableName}.${sessionField}),'.'
    ,TRUNC(((EXTRACT(MINUTE FROM ${tableName}.${sessionField})*100)/60))) AS label,
    COALESCE(ROUND(SUM(${tableName}.${dataField})), 0) AS total
    FROM ${tableName}
    WHERE DATE(${tableName}.session_date) BETWEEN $2 AND $3
    AND ${tableName}.user_id = $1
    GROUP BY label
    ORDER BY label`;
    const queryParms = [userId, startDate, endDate];
    const toolkitData = await this.database.query<GraphQueryResponse>(
      query,
      queryParms,
    );

    return toolkitData;
  }

  async getRewardsData(
    userId: string,
    toolkitId: string,
  ): Promise<AnswersHistoryRewards> {
    const getEarnedRewardPointsQuery = `
    SELECT COALESCE(SUM(hlp_reward_points_awarded),0) as earned FROM user_rewards WHERE user_id='${userId}' AND tool_kit_id='${toolkitId}';
    `;
    const bonusesQuery = `SELECT COALESCE(SUM(bonuses.hlp_reward_points),0) AS bonuses FROM bonuses
    RIGHT JOIN user_bonus_claimed ON user_bonus_claimed.bonus_id=bonuses.id AND user_bonus_claimed.user_id='${userId}'
    WHERE bonuses.toolkit_id='${toolkitId}'`;
    const data = await this.database.batchQuery(
      getEarnedRewardPointsQuery + bonusesQuery,
    );
    const [{ earned }, { bonuses }] = data.flat();
    return { earned: parseInt(earned), bonuses: parseInt(bonuses) };
  }
  async getChallengeByToolkit(
    id: string,
    userId: string,
  ): Promise<ToolkitChallenge> {
    const query = `SELECT challenges.id,challenges.title,
    CASE
    WHEN user_challenges.challenge_id=challenges.id THEN true ELSE false END AS is_joined FROM challenges
    LEFT JOIN user_challenges ON user_challenges.challenge_id=challenges.id AND user_challenges.user_id=$2
    WHERE challenges.tool_kit_id=$1 AND challenges.is_challenge_completed=false;`;
    const [challenge] = await this.database.query<ToolkitChallenge>(query, [
      id,
      userId,
    ]);
    return challenge;
  }

  async getAnswersHistoryStreaks(
    toolkitId: string,
    userId: string,
  ): Promise<AnswersHistoryStreak[]> {
    const query = `SELECT streak_count,
    CASE
    WHEN user_streaks.streak_id=toolkit_streaks.id THEN true ELSE false
    END AS is_completed FROM toolkit_streaks
    LEFT JOIN user_streaks ON user_streaks.streak_id=toolKit_streaks.id AND user_streaks.user_id=$1
    WHERE toolkit_streaks.tool_kit=$2
    ORDER By toolkit_streaks.streak_count ASC`;
    const streaks = await this.database.query<AnswersHistoryStreak>(query, [
      userId,
      toolkitId,
    ]);
    return streaks;
  }

  async getAnswersHistory(
    tableName: string,
    emojiField: string,
    titleFormat: string,
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
    checkinId?: string,
  ): Promise<AnswerHistory[]> {
    let query = `SELECT session_date,CONCAT(${titleFormat}) AS title,${emojiField} AS emoji, session_id,tool_kit_id AS toolkit_id,schedule_id FROM ${tableName}
    WHERE user_id=$1 AND tool_kit_id= $2
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4;`;
    const queryParams = [userId, toolkitId, limit, offset];
    if (checkinId) {
      query = `
      SELECT session_date,CONCAT(${titleFormat}) AS title,${emojiField} AS emoji, session_id,tool_kit_id AS toolkit_id,schedule_id  FROM ${tableName}
      LEFT JOIN schedules ON ${tableName}.schedule_id = schedules.id
      WHERE user_id=$1 AND tool_kit_id= $2 AND schedules.check_in = $5
      ORDER BY ${tableName}.created_at DESC
      LIMIT $3 OFFSET $4;`;
      queryParams.push(checkinId);
    }
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );

    return history;
  }

  async getFormsToolkitHistory(
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
    checkinId?: string,
  ): Promise<AnswerHistory[]> {
    let query = `SELECT user_form_answers.session_date, forms.title, session_id,tool_kit_id AS toolkit_id,schedule_id
    FROM user_form_answers
    LEFT JOIN forms ON user_form_answers.form_id = forms.id
    WHERE user_form_answers.user_id = $1
    AND user_form_answers.tool_kit_id= $2
    ORDER BY user_form_answers.created_at DESC
    LIMIT $3 OFFSET $4;`;
    const queryParams = [userId, toolkitId, limit, offset];
    if (checkinId) {
      query = `SELECT user_form_answers.session_date, forms.title, session_id
        FROM user_form_answers
        LEFT JOIN forms ON user_form_answers.form_id = forms.id
        LEFT JOIN schedules ON user_form_answers.schedule_id = schedules.id
        WHERE user_form_answers.user_id = $1
        AND user_form_answers.tool_kit_id= $2
        AND schedules.check_in = $5
        ORDER BY user_form_answers.created_at DESC
        LIMIT $3 OFFSET $4;`;
      queryParams.push(checkinId);
    }
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );
    return history;
  }
  async getAudioToolkitHistory(
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
  ): Promise<AnswerHistory[]> {
    const query = `SELECT
    audio_tool_kit_files.title as title,
    audio_tool_kit_answers_table.session_id as session_id,
    audio_tool_kit_answers_table.session_date as session_date,
    audio_tool_kit_answers_table.feeling as emoji,
    audio_tool_kit_answers_table.tool_kit_id AS toolkit_id,
    audio_tool_kit_answers_table.schedule_id AS schedule_id
  FROM
    audio_tool_kit_answers_table
    JOIN audio_tool_kit_files ON audio_tool_kit_files.id=audio_tool_kit_answers_table.audio_id
  WHERE
    audio_tool_kit_answers_table.user_id = $1
    AND audio_tool_kit_answers_table.tool_kit_id = $2
  ORDER BY
    audio_tool_kit_answers_table.created_at DESC
    LIMIT $3 OFFSET $4;`;
    const queryParams = [userId, toolkitId, limit, offset];
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );
    return history;
  }
  async getEpisodesToolkitHistory(
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
    checkinId?: string,
  ): Promise<AnswerHistory[]> {
    let query = `SELECT tool_kit_episodes_answers.session_date, tool_kits.title, session_id,tool_kit_id AS toolkit_id,schedule_id
    FROM tool_kit_episodes_answers
    LEFT JOIN tool_kits ON tool_kit_episodes_answers.tool_kit_id = tool_kits.id
    WHERE tool_kit_episodes_answers.user_id = $1
    AND tool_kit_episodes_answers.tool_kit_id= $2
    ORDER BY tool_kit_episodes_answers.created_at DESC
    LIMIT $3 OFFSET $4;`;
    const queryParams = [userId, toolkitId, limit, offset];
    if (checkinId) {
      query = `SELECT tool_kit_episodes_answers.session_date, tool_kits.title, session_id
      FROM tool_kit_episodes_answers
      LEFT JOIN tool_kits ON tool_kit_episodes_answers.tool_kit_id = tool_kits.id
      LEFT JOIN schedules ON tool_kit_episodes_answers.schedule_id = schedules.id
      WHERE tool_kit_episodes_answers.user_id = $1
      AND tool_kit_episodes_answers.tool_kit_id= $2
      AND schedules.check_in = $5
      ORDER BY tool_kit_episodes_answers.created_at DESC
      LIMIT $3 OFFSET $4;`;
      queryParams.push(checkinId);
    }
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );
    return history;
  }

  async getHabitsToolkitHistory(
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
    checkinId?: string,
  ): Promise<AnswerHistory[]> {
    let query = `SELECT habit_tool_kit_answers.session_date, tool_kits.title, session_id,tool_kit_id AS toolkit_id,schedule_id
    FROM habit_tool_kit_answers
    LEFT JOIN tool_kits ON habit_tool_kit_answers.tool_kit_id = tool_kits.id
    WHERE habit_tool_kit_answers.user_id = $1
    AND habit_tool_kit_answers.tool_kit_id = $2
    ORDER BY habit_tool_kit_answers.created_at DESC
    LIMIT $3 OFFSET $4;`;
    const queryParams = [userId, toolkitId, limit, offset];
    if (checkinId) {
      query = `SELECT habit_tool_kit_answers.session_date, tool_kits.title, session_id
      FROM habit_tool_kit_answers
      LEFT JOIN tool_kits ON habit_tool_kit_answers.tool_kit_id = tool_kits.id
      LEFT JOIN schedules ON habit_tool_kit_answers.schedule_id = schedules.id
      WHERE habit_tool_kit_answers.user_id = $1
      AND habit_tool_kit_answers.tool_kit_id = $2
      AND schedules.check_in = $5
      ORDER BY habit_tool_kit_answers.created_at DESC
      LIMIT $3 OFFSET $4;`;
      queryParams.push(checkinId);
    }
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );
    return history;
  }

  async getDrinkWaterAnswersHistory(
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
  ): Promise<AnswerHistory[]> {
    const query = `SELECT session_date, session_id FROM drink_water_tool_kit_answers
    WHERE user_id=$1 AND tool_kit_id=$2
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4;`;
    const history = await this.database.query<AnswerHistory>(query, [
      userId,
      toolkitId,
      limit,
      offset,
    ]);
    return history;
  }

  async getMoodToolkitHistory(
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
    checkinId?: string,
  ): Promise<AnswerHistory[]> {
    let query = `SELECT mood_check_categories.title,
        mood_check_categories.file_path as mood_emoji_file_path,
        mood_tool_kit_answers.session_id,
        mood_tool_kit_answers.session_date,
        mood_tool_kit_answers.tool_kit_id AS toolkit_id,
        mood_tool_kit_answers.schedule_id
        FROM mood_tool_kit_answers
          LEFT JOIN mood_check_categories ON mood_tool_kit_answers.mood_category_id = mood_check_categories.id
        WHERE mood_tool_kit_answers.user_id = $1 AND mood_tool_kit_answers.tool_kit_id = $2
        ORDER BY mood_tool_kit_answers.created_at DESC
        LIMIT $3
        OFFSET $4`;
    const queryParams = [userId, toolkitId, limit, offset];
    if (checkinId) {
      query = `SELECT mood_check_categories.title,
        mood_check_categories.file_path as mood_emoji_file_path,
        mood_tool_kit_answers.session_id,
        mood_tool_kit_answers.session_date
        FROM mood_tool_kit_answers
          LEFT JOIN mood_check_categories ON mood_tool_kit_answers.mood_category_id = mood_check_categories.id
          LEFT JOIN schedules ON mood_tool_kit_answers.schedule_id = schedules.id
        WHERE mood_tool_kit_answers.user_id = $1 AND mood_tool_kit_answers.tool_kit_id = $2 AND schedules.check_in = $5
        ORDER BY mood_tool_kit_answers.created_at DESC
        LIMIT $3 OFFSET $4;`;
      queryParams.push(checkinId);
    }
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );
    return history;
  }

  async getToolkitById(id: string): Promise<ToolKit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [toolkit] = await this.database.query<ToolKit>(query, [id]);
    return toolkit;
  }

  async getAnswersCalender(
    tableName: string,
    userId: string,
    startdate: string,
    endDate: string,
    toolkitId: string,
    checkinId?: string,
  ): Promise<AnswersHistoryCalenderQueryResult[]> {
    let query = `SELECT session_date::date as day FROM ${tableName}
    WHERE ${tableName}.user_id=$1 AND ${tableName}.tool_kit_id=$4 AND ${tableName}.session_date BETWEEN $2 AND $3
    GROUP BY day
    ORDER BY day`;
    const queryParams = [userId, startdate, endDate, toolkitId];

    if (checkinId) {
      query = `SELECT session_date::date as day FROM ${tableName}
      LEFT JOIN schedules ON ${tableName}.schedule_id = schedules.id
      WHERE ${tableName}.user_id=$1 AND ${tableName}.tool_kit_id=$4
      AND ${tableName}.session_date BETWEEN $2 AND $3
      AND schedules.check_in = $5
      GROUP BY day
      ORDER BY day`;
      queryParams.push(checkinId);
    }
    const calender =
      await this.database.query<AnswersHistoryCalenderQueryResult>(
        query,
        queryParams,
      );
    return calender;
  }

  async getNoTitleAnswersHistory(
    tableName: string,
    emojiField: string,
    userId: string,
    toolkitId: string,
    limit: number,
    offset: number,
    checkinId?: string,
  ): Promise<AnswerHistory[]> {
    let query = `SELECT session_date, ${emojiField} AS emoji, session_id,tool_kit_id AS toolkit_id,schedule_id FROM ${tableName}
    WHERE user_id=$1 AND tool_kit_id=$2
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4;`;
    const queryParams = [userId, toolkitId, limit, offset];
    if (checkinId) {
      query = ` SELECT session_date, ${emojiField} AS emoji, session_id,tool_kit_id AS toolkit_id,schedule_id FROM ${tableName}
      LEFT JOIN schedules ON ${tableName}.schedule_id = schedules.id
      WHERE ${tableName}.user_id=$1 AND ${tableName}.tool_kit_id=$2 AND schedules.check_in = $5
      ORDER BY ${tableName}.created_at DESC
      LIMIT $3 OFFSET $4;`;
      queryParams.push(checkinId);
    }
    const history = await this.database.query<AnswerHistory>(
      query,
      queryParams,
    );
    return history;
  }

  private prepareGraphAvgData(
    label: GraphAverageLabels,
    value: string,
  ): GraphAvgResponse[] {
    return [
      {
        label: `${label}`,
        value: `${value}`,
      },
    ];
  }

  async getWeightAvg(graphData: PepareGraphData): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT CONCAT(COALESCE(ROUND(AVG(weight)),0),'kg') as avg_weight
    FROM weight_intake_tool_kit_answers
    WHERE user_id = $1
    AND weight_intake_tool_kit_answers.session_date BETWEEN $2 AND $3`;
    const [{ avg_weight }] = await this.database.query<{
      avg_weight: string;
    }>(query, [userId, startDate, endDate]);
    const label = this.translationService.translate(
      'constant.graph_label_for_weight',
    ) as GraphAverageLabels;
    return this.prepareGraphAvgData(label, avg_weight);
  }

  async getAlcoholAvg(graphData: PepareGraphData): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT COALESCE(ROUND(AVG(doses)),0) as avg_doses
    FROM alcohol_intake_tool_kit_answers
    WHERE user_id = $1
    AND alcohol_intake_tool_kit_answers.session_date BETWEEN $2 AND $3`;
    const [{ avg_doses }] = await this.database.query<{
      avg_doses: number;
    }>(query, [userId, startDate, endDate]);
    const label = this.translationService.translate(
      'constant.graph_label_for_alcohol_intake',
    ) as GraphAverageLabels;

    return this.prepareGraphAvgData(label, `${avg_doses}`);
  }
  public convertMinutesToHoursAndMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${Number(hours)}h ${Number(minutes)}m`;
  }
  async getSleepcheckAvg(
    graphData: PepareGraphData,
  ): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT
    COALESCE(ROUND(AVG(total_sleep_time)), 0) as avg_sleep,
    COALESCE(ROUND(AVG(deep_sleep_time)), 0) as avg_light_sleep,
    COALESCE(ROUND(AVG(light_sleep_time)), 0) as avg_deep_sleep
    FROM sleep_check_tool_kit_answers
    WHERE user_id = $1
    AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3`;
    const [{ avg_sleep, avg_light_sleep, avg_deep_sleep }] =
      await this.database.query<{
        avg_sleep: number;
        avg_light_sleep: number;
        avg_deep_sleep: number;
      }>(query, [userId, startDate, endDate]);
    const avgSleep = this.convertMinutesToHoursAndMinutes(avg_sleep);
    const avgDeepSleep = this.convertMinutesToHoursAndMinutes(avg_deep_sleep);
    const avgLightSleep = this.convertMinutesToHoursAndMinutes(avg_light_sleep);
    const data: GraphAvgResponse[] = [
      {
        label: this.translationService.translate(
          'constant.graph_label_for_total_sleep',
        ),
        value: `${avgSleep}`,
      },
      {
        label: this.translationService.translate(
          'constant.graph_label_for_deep_sleep',
        ),
        value: `${avgDeepSleep}`,
      },
      {
        label: this.translationService.translate(
          'constant.graph_label_for_light_sleep',
        ),
        value: `${avgLightSleep}`,
      },
    ];
    return data;
  }
  async getSportskAvg(graphData: PepareGraphData): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT
    COALESCE(ROUND(AVG(duration)), 0) as avg_duration
    FROM sports_tool_kit_answers
    WHERE user_id = $1
    AND sports_tool_kit_answers.session_date BETWEEN $2 AND $3`;
    const [{ avg_duration }] = await this.database.query<{
      avg_duration: number;
    }>(query, [userId, startDate, endDate]);
    const avgDuration = this.convertMinutesToHoursAndMinutes(avg_duration);

    const data: GraphAvgResponse[] = [
      {
        label: this.translationService.translate(
          'constant.graph_label_for_sport',
        ),
        value: `${avgDuration}`,
      },
    ];
    return data;
  }

  async getHeartRateAvg(
    graphData: PepareGraphData,
  ): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = ` SELECT
    COALESCE(ROUND(AVG(average_heart_rate)), 0) as avg_heart_rate
    FROM heart_rate_tool_kit_answers
    WHERE user_id = $1
    AND heart_rate_tool_kit_answers.session_date BETWEEN $2 AND $3;`;
    const [{ avg_heart_rate }] = await this.database.query<{
      avg_heart_rate: string;
    }>(query, [userId, startDate, endDate]);
    const label = this.translationService.translate(
      'constant.graph_label_for_heart_rate',
    ) as GraphAverageLabels;
    return this.prepareGraphAvgData(label, avg_heart_rate);
  }

  async getEcgAvg(graphData: PepareGraphData): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT COALESCE(ROUND(AVG(spm)),0) as avg_heart
    FROM ecg_tool_kit_answers
    WHERE user_id = $1 AND ecg_tool_kit_answers.session_date BETWEEN $2 AND $3`;
    const [{ avg_heart }] = await this.database.query<{
      avg_heart: number;
    }>(query, [userId, startDate, endDate]);
    const label = this.translationService.translate(
      'constant.graph_label_for_ecg',
    ) as GraphAverageLabels;
    return this.prepareGraphAvgData(label, `${avg_heart}`);
  }
  async getStepsAvg(graphData: PepareGraphData): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT
    COALESCE(ROUND(AVG(steps)),0) as avg_steps,
    CONCAT(COALESCE(ROUND(CAST(AVG(distance) AS numeric),1),0),' ','kilometers') as avg_distance
    FROM steps_tool_kit_answers
    WHERE user_id = $1
    AND steps_tool_kit_answers.session_date BETWEEN $2 AND $3`;
    const [{ avg_steps, avg_distance }] = await this.database.query<{
      avg_steps: number;
      avg_distance: string;
    }>(query, [userId, startDate, endDate]);
    const data: GraphAvgResponse[] = [
      {
        label: this.translationService.translate(
          'constant.graph_label_for_steps',
        ),
        value: `${avg_steps}`,
      },
      {
        label: this.translationService.translate(
          'constant.graph_label_for_steps_distance',
        ),
        value: `${avg_distance}`,
      },
    ];
    return data;
  }
  async getMeditationAvg(
    graphData: PepareGraphData,
  ): Promise<GraphAvgResponse[]> {
    const { userId, startDate, endDate } = graphData;
    const query = `SELECT COALESCE(ROUND(AVG(meditation_time)), 0) as avg_meditation_time
    FROM meditation_tool_kit_answers
    WHERE user_id = $1
    AND meditation_tool_kit_answers.session_date BETWEEN $2 AND $3;`;
    const [{ avg_meditation_time }] = await this.database.query<{
      avg_meditation_time: number;
    }>(query, [userId, startDate, endDate]);
    const avgMeditationTime = ms(Number(avg_meditation_time) * 60000);
    const label = this.translationService.translate(
      'constant.graph_label_for_meditation',
    ) as GraphAverageLabels;
    return this.prepareGraphAvgData(label, avgMeditationTime);
  }

  private dynamicSqlORstringGenerator(input: string[], key: string): string {
    let start = ` AND (`;
    const end = `)`;
    let length = input.length;
    let subString = ``;
    let c = 3;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _inp of input) {
      length--;
      subString = `${key} = $${c}`;
      start = start.concat(subString);
      c++;
      if (!length) {
        start = start.concat(end);
        return start;
      }
      start += ` OR `;
    }
    return subString;
  }

  async getUserById(user_id: string): Promise<Users> {
    const query = `
    SELECT * FROM users WHERE id=$1;
    `;
    const [data] = await this.database.query<Users>(query, [user_id]);
    return data;
  }

  async getToolkitCategoryByUserId(
    user_id: string,
    age_group: string,
    goal_ids: string[],
  ): Promise<ToolkitCategory[]> {
    const query = `
      SELECT
        tool_kit_category.*
      FROM
        tool_kit_category
        INNER JOIN tool_kits ON tool_kit_category.id = tool_kits.tool_kit_category
        INNER JOIN goals ON tool_kits.goal_id = goals.id
        INNER JOIN user_goals ON goals.id = user_goals.goal
      WHERE
        user_goals.user_id = $1 AND
        tool_kit_category.age_group=$2;
    `;
    const filterQuery = this.dynamicSqlORstringGenerator(goal_ids, 'goal_id');
    const finalQuery =
      query.split(';')[0] + filterQuery + ` ORDER BY title ASC;`;
    this.logger.log(finalQuery);
    const data = await this.database.query<ToolkitCategory>(finalQuery, [
      user_id,
      age_group,
      ...goal_ids,
    ]);
    return data;
  }

  async searchToolkits(
    name: string,
    organisationId: string,
    ageGroup: string,
    role: string,
    goalIds?: string[],
    lang?: string,
  ): Promise<ToolKit[]> {
    const goals = goalIds && goalIds.length;
    const query = `
    SELECT 
    tool_kits.*, 
    CASE
      WHEN tool_kits.translations ->> $5 IS NOT NULL THEN (tool_kits.translations ->> $5) ::json ->> 'title'
      ELSE tool_kits.title
    END AS title,
    CASE
      WHEN tool_kits.translations ->> $5 IS NOT NULL THEN (tool_kits.translations ->> $5) ::json ->> 'short_description'
      ELSE tool_kits.short_description
    END AS short_description
  FROM tool_kits
      LEFT JOIN membership_levels ON membership_levels.id = tool_kits.membership_level_id
      LEFT JOIN membership_stages ON membership_stages.id = tool_kits.membership_stage_id
      LEFT JOIN tool_kit_organisations ON tool_kit_organisations.organisation_id = $2
      WHERE 
        (
          tool_kits.title ILIKE $1 
          OR
          (
            tool_kits.translations ->> $5 IS NOT NULL 
            AND
            (tool_kits.translations ->> $5) ::json ->> 'title' ILIKE $1
          )
        )
        AND status = true 
        AND tool_kits.id = tool_kit_organisations.tool_kit_id
        AND $3 = ANY(tool_kits.access_group)
        AND $4 = ANY(tool_kits.access_roles)
        ${goals ? 'AND tool_kits.goal_id = ANY($7)' : ''}
    `;
    const params: unknown[] = [
      `%${name}%`,
      organisationId,
      ageGroup,
      role,
      lang,
    ];
    if (goals) {
      params.push(goalIds);
    }
    const toolkits = await this.database.query<ToolKit>(query, params);
    return toolkits;
  }

  async getToolkitAnswerAndScheduleBySessionId(
    sessionId: string,
    tableName: string,
    userId: string,
  ): Promise<ToolkitAnswerAndSchedule> {
    const query = `SELECT json_agg(${tableName}.*) AS answer, json_agg(schedules.*) AS schedule FROM ${tableName}
     INNER JOIN schedules ON schedules.id = ${tableName}.schedule_id WHERE session_id=$1 AND user_id=$2
    GROUP BY ${tableName}.id;`;
    const [data] = await this.database.query<ToolkitAnswerAndSchedule>(query, [
      sessionId,
      userId,
    ]);
    return data;
  }

  async getToolkitAnswerBySessions(
    userId: string,
    startDate: Date,
    endDate: Date,
    tableName: string,
    scheduleId: string,
  ): Promise<number> {
    const query = `SELECT COALESCE(COUNT(*),0) AS count FROM ${tableName} WHERE user_id=$1 AND schedule_id=$4 AND session_date BETWEEN $2 AND $3;`;
    const [{ count }] = await this.database.query<{ count: number }>(query, [
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
      scheduleId,
    ]);
    return count;
  }

  async getToolkitAnswersHasOptionsBySessions(
    userId: string,
    startDate: Date,
    endDate: Date,
    tableName: string,
    fieldName: string,
    scheduleId: string,
  ): Promise<number> {
    const query = `SELECT COALESCE(SUM(${tableName}.${fieldName}),0) AS sum
    FROM ${tableName} WHERE user_id=$1 AND schedule_id=$4 AND session_date BETWEEN $2 AND $3;`;
    const [{ sum }] = await this.database.query<{ sum: number }>(query, [
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
      scheduleId,
    ]);
    return sum;
  }

  async getToolkitAnswersOptions(
    optionTable: string,
    optionField: string,
    selectedTable: string,
    selectedField: string,
    scheduleId: string,
  ): Promise<number> {
    const query = `SELECT ${optionTable}.${optionField} AS option_value
    FROM
    ${selectedTable}
    LEFT JOIN ${optionTable} ON ${optionTable}.id = ${selectedTable}.${selectedField}
    WHERE ${selectedTable}.schedule_id = $1
    GROUP BY ${optionTable}.id;`;
    const [toolkitOption] = await this.database.query<{ option_value: number }>(
      query,
      [scheduleId],
    );
    return toolkitOption.option_value;
  }

  async getWeightAndMedicationToolkitAnswersOptions(
    selectedTable: string,
    selectedField: string,
    scheduleId: string,
  ): Promise<number> {
    const query = `SELECT ${selectedTable}.${selectedField} AS option_value
    FROM
    ${selectedTable}
    WHERE ${selectedTable}.schedule_id = $1;`;
    const [toolkitOption] = await this.database.query<{ option_value: number }>(
      query,
      [scheduleId],
    );
    return toolkitOption.option_value;
  }

  async getToolitUnitById(unitId: string): Promise<string> {
    const query = `SELECT unit FROM units
    WHERE id = $1;`;
    const [result] = await this.database.query<{ unit: string }>(query, [
      unitId,
    ]);
    return result.unit;
  }

  async getHabitToolkitAnswer(
    habitId: string,
    userId: string,
  ): Promise<HabitToolkitAnswers> {
    const query = `SELECT habit_tool_kit_tools_answers.* FROM habit_tools
    LEFT JOIN habit_tool_kit_tools_answers
    ON habit_tools.id = habit_tool_kit_tools_answers.habit_id
    WHERE habit_tools.id = $1 AND habit_tool_kit_tools_answers.user_id = $2`;
    const [answers] = await this.database.query<HabitToolkitAnswers>(query, [
      habitId,
      userId,
    ]);
    return answers;
  }

  async getToolkitSessionCount(
    toolkitId: string,
    userId: string,
  ): Promise<{
    session_count: number;
  }> {
    const query = `SELECT COUNT(user_schedule_sessions.*) as session_count  FROM tool_kits
    LEFT JOIN goals ON tool_kits.goal_id = goals.id
    LEFT JOIN user_schedule_sessions ON user_schedule_sessions.tool_kit_id = tool_kits.id
    WHERE user_schedule_sessions.tool_kit_id = $1 AND user_schedule_sessions.user_id = $2;`;
    const [result] = await this.database.query<{
      session_count: number;
    }>(query, [toolkitId, userId]);
    return result;
  }

  async getUserGoalLevelsByGoalId(
    userId: string,
    goalId: string,
  ): Promise<UserGoalLevels[]> {
    const query = `SELECT goal_levels.*,
    CASE
    WHEN goal_levels.id = user_goal_levels.goal_level_id THEN true ELSE false END AS is_completed,
    CASE
    WHEN user_goals.user_id = $1 THEN true ELSE false END AS is_goal_selected
    FROM goal_levels
    LEFT JOIN user_goals ON user_goals.goal = $2 AND user_goals.user_id= $1
    LEFT JOIN user_goal_levels ON user_goal_levels.goal_level_id = goal_levels.id AND user_goal_levels.user_id = $1
    WHERE goal_levels.goal_id = $2
    ORDER BY goal_levels.sequence_number ASC;`;
    const userGoalLevels = await this.database.query<UserGoalLevels>(query, [
      userId,
      goalId,
    ]);
    return userGoalLevels;
  }

  async getToolkitAndGoalByToolkitId(goalId: string): Promise<ToolkitAndGoal> {
    const query = `SELECT json_agg(tool_kits.*) AS toolkit, json_agg(goals.*) AS goal FROM tool_kits
    LEFT JOIN goals ON tool_kits.goal_id = goals.id
    WHERE tool_kits.id = $1;`;
    const [goal] = await this.database.query<ToolkitAndGoal>(query, [goalId]);
    return goal;
  }

  async isToolkitAnswersOptionsSelected(
    selectedTable: string,
    scheduleId: string,
    userId: string,
  ): Promise<boolean> {
    const query = `SELECT CASE COUNT(*) WHEN 0 THEN FALSE ELSE TRUE END AS is_selected
    FROM
    ${selectedTable}
    WHERE ${selectedTable}.schedule_id = $1 AND user_id = $2;`;
    const [toolkitOption] = await this.database.query<{ is_selected: boolean }>(
      query,
      [scheduleId, userId],
    );
    return toolkitOption.is_selected;
  }

  async getSportsToolkitActivityAndIntensity(
    sessionId: string,
    userId: string,
  ): Promise<{
    activities: Activities[];
    intensities: Intensities[];
  }> {
    const query = `SELECT
    json_agg(activities.*) AS activities ,
    json_agg(intensities.*) AS intensities
  FROM
    sports_tool_kit_answers
    LEFT JOIN activities ON sports_tool_kit_answers.activity_id = activities.id
    LEFT JOIN intensities ON sports_tool_kit_answers.intensity_id = intensities.id
  WHERE
    sports_tool_kit_answers.session_id = $1
    AND sports_tool_kit_answers.user_id = $2`;
    const [response] = await this.database.query<{
      activities: Activities[];
      intensities: Intensities[];
    }>(query, [sessionId, userId]);
    return response;
  }

  async getAlcoholTypes(
    sessionId: string,
    userId: string,
  ): Promise<AlchoholTypes> {
    const query = `SELECT
    alchohol_types.*
  FROM
    alcohol_intake_tool_kit_answers
    LEFT JOIN alchohol_types ON alcohol_intake_tool_kit_answers.alcohol_type_id = alchohol_types.id
  WHERE
    alcohol_intake_tool_kit_answers.session_id = $1
    AND alcohol_intake_tool_kit_answers.user_id = $2`;
    const [response] = await this.database.query<AlchoholTypes>(query, [
      sessionId,
      userId,
    ]);
    return response;
  }

  async getMoodCategories(
    moodCategoryId: string,
    moodSubCategories: string[],
  ): Promise<MoodCheckCategoryAndSubCategory> {
    const query = `SELECT ROW_TO_JSON(mood_check_categories.*) mood_check_category,
    JSON_AGG(mood_check_sub_categories.*) mood_check_sub_category
    FROM mood_check_categories
    LEFT JOIN mood_check_sub_categories ON mood_check_categories.id = mood_check_sub_categories.category_id
    WHERE mood_check_categories.id = $1 AND mood_check_sub_categories.id = ANY( $2 ::uuid[] )
    GROUP BY mood_check_categories.id`;
    const [response] =
      await this.database.query<MoodCheckCategoryAndSubCategory>(query, [
        moodCategoryId,
        moodSubCategories,
      ]);
    return response;
  }

  async getPlayedAudioToolkitAudioFiles(
    sessionId: string,
  ): Promise<PlayedAudioToolkitAudioFile[]> {
    const query = `SELECT played_audio_toolkit_audio_files.*
    FROM audio_tool_kit_answers_table
    JOIN played_audio_toolkit_audio_files ON played_audio_toolkit_audio_files.session_id = audio_tool_kit_answers_table.session_id 
    WHERE audio_tool_kit_answers_table.session_id = $1
    GROUP BY played_audio_toolkit_audio_files.id`;
    const response = await this.database.query<PlayedAudioToolkitAudioFile>(
      query,
      [sessionId],
    );
    return response;
  }

  async getToolkitAndCheckin(
    checkinId: string,
    toolkitId: string,
  ): Promise<{ check_ins: Checkin; tool_kit: ToolKit }> {
    const query = `SELECT row_to_json(check_ins.*) AS check_ins ,row_to_json(tool_kits.*) AS tool_kit FROM check_ins
    LEFT JOIN tool_kits ON check_ins.tool_kit_id = tool_kits.id
    WHERE check_ins.id=$1 AND check_ins.tool_kit_id = $2`;
    const queryParams = [checkinId, toolkitId];
    const [response] = await this.database.query<{
      check_ins: Checkin;
      tool_kit: ToolKit;
    }>(query, queryParams);
    return response;
  }

  async getToolkitCompletedSessionsCount(
    userId: string,
    scheduleId: string,
    date: string,
    toolkitType: ToolkitType,
  ): Promise<number> {
    const toolKitAnswersTableName = toolkitAnswerTables.get(toolkitType);
    if (!toolKitAnswersTableName) {
      throw new NotFoundException(`No toolkit answers table name`);
    }
    const query = `SELECT COALESCE(COUNT(*), 0) AS count FROM ${toolKitAnswersTableName}
    WHERE user_id = $1 AND schedule_id = $2 AND session_date = $3`;
    const [{ count }] = await this.database.query<{ count: number }>(query, [
      userId,
      scheduleId,
      date,
    ]);
    return count;
  }

  getWeightToolkitSelectedOptionQuery(): string {
    return `SELECT weight AS option_value FROM
    weight_tool_kit_option_selected_by_user
    WHERE schedule_id = $1;`;
  }

  getMedicationToolkitSelectedOptionQuery(): string {
    return `SELECT doses AS option_value FROM
    medication_tool_kit_info_planned_by_user
    WHERE schedule_id = $1;`;
  }

  async getSelectedOptionValueByUser(
    scheduleId: string,
    toolkitType: ToolkitType,
  ): Promise<string> {
    const selectedTable = toolkitSelectedOptionTables.get(toolkitType);
    const optionTable = toolkitOptionsTableNames.get(toolkitType);
    const optionField = toolkitOptionsFieldNames.get(toolkitType);
    const selectedField = toolkitOptionsSelectedFieldNames.get(toolkitType);

    let query = `SELECT ${optionTable}.${optionField} AS option_value
    FROM
    ${selectedTable}
    LEFT JOIN ${optionTable} ON ${optionTable}.id = ${selectedTable}.${selectedField}
    WHERE ${selectedTable}.schedule_id = $1
    GROUP BY ${optionTable}.id;`;

    if (toolkitType === ToolkitType.MEDICATION) {
      query = this.getMedicationToolkitSelectedOptionQuery();
    }
    if (toolkitType === ToolkitType.WEIGHT) {
      query = this.getWeightToolkitSelectedOptionQuery();
    }
    const [toolkitOption] = await this.database.query<{ option_value: string }>(
      query,
      [scheduleId],
    );
    return toolkitOption.option_value;
  }

  async getLoggedToolkitDataBySchedule(
    scheduleId: string,
    date: string,
    toolkitType: ToolkitType,
  ): Promise<number> {
    const tableName = toolkitAnswerTables.get(toolkitType);
    const fieldName = toolkitAnswersValueFieldNames.get(toolkitType);

    const query = `SELECT COALESCE(SUM(${tableName}.${fieldName}),0) AS total
    FROM ${tableName} WHERE schedule_id=$1 AND session_date <= $2;`;
    const [{ total }] = await this.database.query<{ total: number }>(query, [
      scheduleId,
      date,
    ]);
    return total;
  }

  async getUserGoalLevelsWithStatus(
    userId: string,
    goalId: string,
    lang?: string,
  ): Promise<GoalLevelWithStatus[]> {
    const query = `  SELECT goal_levels.*,
    COALESCE(goal_levels.id = user_goal_levels.goal_level_id, false) AS is_completed,
    CASE
      WHEN goal_levels.translations ->> $3 IS NOT NULL THEN (goal_levels.translations ->> $3) ::json ->> 'title'
      ELSE goal_levels.title
    END AS title
    FROM goal_levels
    LEFT JOIN user_goals ON user_goals.goal = $2 AND user_goals.user_id = $1
    LEFT JOIN user_goal_levels ON user_goal_levels.goal_level_id = goal_levels.id AND user_goal_levels.user_id = $1
    WHERE goal_levels.goal_id = $2 AND user_goals.user_id = $1 AND user_goals.goal = $2
    ORDER BY goal_levels.sequence_number ASC;`;
    const userGoalLevels = await this.database.query<GoalLevelWithStatus>(
      query,
      [userId, goalId, lang],
    );
    return userGoalLevels;
  }

  async getGoalById(id: string): Promise<Goal> {
    const query = `SELECT * FROM goals WHERE id=$1`;
    const [goal] = await this.database.query<Goal>(query, [id]);
    return goal;
  }

  async getUserMembershipLevels(
    userId: string,
  ): Promise<UserMembershipLevel[]> {
    const query = `SELECT * FROM user_membership_levels WHERE user_id=$1`;
    const membershipLevels = await this.database.query<UserMembershipLevel>(
      query,
      [userId],
    );
    return membershipLevels;
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

  async getScheduleAndToolkitWithUserFormAnswer(
    scheudleId: string,
    toolkitId: string,
  ): Promise<{
    schedule: ScheduleNew;
    toolkit: Toolkit;
    user_form_answer?: UserFormAnswer;
  }> {
    const query = `SELECT
        ROW_TO_JSON(schedules.*) AS schedule,
        ROW_TO_JSON(tool_kits.*) AS toolkit,
        (
          SELECT ROW_TO_JSON(user_form_answer.*) FROM user_form_answers AS user_form_answer
          WHERE user_form_answer.schedule_id = schedules.id AND user_form_answer.episode_session_id IS NOT NULL
          ORDER BY user_form_answer.created_at DESC
          LIMIT 1
        ) AS user_form_answer
      FROM schedules
        LEFT JOIN tool_kits ON tool_kits.id = $2
      WHERE
        schedules.id = $1;
  `;
    const [scheduleWithFormAnswer] = await this.database.query<{
      schedule: ScheduleNew;
      toolkit: Toolkit;
      user_form_answer?: UserFormAnswer;
    }>(query, [scheudleId, toolkitId]);
    return scheduleWithFormAnswer;
  }

  async getEpisodeToolkitFormsWithStatus(
    toolkitId: string,
    scheudleId?: string,
    episodeSessionId?: string,
  ): Promise<EpisodeFormWithStatus[]> {
    const query = `SELECT forms.*, tool_kits_episodes.id AS episode_id, tool_kits_episodes.tool_kit_id,user_form_answers.session_id AS session_id,
    CASE
      WHEN user_form_answers.id IS NOT NULL THEN true
      ELSE false
    END AS is_completed
    FROM tool_kits_episodes
    JOIN forms ON tool_kits_episodes.form_id = forms.id
    LEFT JOIN user_form_answers ON tool_kits_episodes.form_id = user_form_answers.form_id AND user_form_answers.episode_session_id IS NOT NULL AND user_form_answers.episode_id IS NOT NULL
     AND tool_kits_episodes.id = user_form_answers.episode_id
     AND user_form_answers.episode_session_id = $3
     AND user_form_answers.schedule_id = $2
    WHERE tool_kits_episodes.tool_kit_id = $1
    ORDER BY tool_kits_episodes.created_at`;
    const episodeToolkitForms =
      await this.database.query<EpisodeFormWithStatus>(query, [
        toolkitId,
        scheudleId,
        episodeSessionId,
      ]);
    return episodeToolkitForms;
  }

  async getEpisodeToolkitVideoWithStatus(
    toolkitId: string,
    scheudleId?: string,
    episodeSessionId?: string,
  ): Promise<EpisodeVideoWithStatus[]> {
    const query = `SELECT tool_kits.*, episode_toolkit_videos.id AS episode_id, episode_toolkit_videos.tool_kit_id, tool_kits.tool_kit_hlp_reward_points AS hlp_reward_points,episode_tool,video_tool_kit_answers.session_id,
    CASE
      WHEN video_tool_kit_answers.id IS NOT NULL THEN true
      ELSE false
    END AS is_completed
    FROM episode_toolkit_videos
    JOIN tool_kits ON tool_kits.id=episode_toolkit_videos.video_toolkit_id
    LEFT JOIN video_tool_kit_answers ON episode_toolkit_videos.video_toolkit_id = video_tool_kit_answers.tool_kit_id AND video_tool_kit_answers.episode_session_id IS NOT NULL AND video_tool_kit_answers.episode_id IS NOT NULL
     AND episode_toolkit_videos.id = video_tool_kit_answers.episode_id
     AND video_tool_kit_answers.episode_session_id = $3
     AND video_tool_kit_answers.schedule_id = $2
    WHERE episode_toolkit_videos.tool_kit_id = $1
    ORDER BY episode_toolkit_videos.created_at`;
    const episodeToolkitForms =
      await this.database.query<EpisodeVideoWithStatus>(query, [
        toolkitId,
        scheudleId,
        episodeSessionId,
      ]);
    return episodeToolkitForms;
  }

  async getEpisodeToolkitAnswer(
    scheduleId: string,
    sessionId: string,
  ): Promise<EpisodesToolkitAnswers> {
    const query = `SELECT * FROM tool_kit_episodes_answers
    WHERE tool_kit_episodes_answers.schedule_id = $1
    AND tool_kit_episodes_answers.session_id = $2`;
    const [episodeAnswer] = await this.database.query<EpisodesToolkitAnswers>(
      query,
      [scheduleId, sessionId],
    );
    return episodeAnswer;
  }

  async getEpisodeSession(
    scheduleId: string,
    tableName: EpisodeToolAnswerTable,
    sessionId?: string,
  ): Promise<EpisodeToolAnswer> {
    let query = `SELECT * FROM ${tableName} WHERE schedule_id = $1 `;
    const params = [scheduleId];

    if (sessionId) {
      query += ' AND episode_session_id = $2';
      params.push(sessionId);
    }
    query += ' ORDER BY created_at DESC';

    const [session] = await this.database.query<EpisodeToolAnswer>(
      query,
      params,
    );
    return session;
  }

  async getAudioToolkitFileById(
    audioFileId: string,
  ): Promise<AudioToolKitFile> {
    const query = `SELECT * FROM audio_tool_kit_files WHERE id=$1;`;
    const [audioToolKitFile] = await this.database.query<AudioToolKitFile>(
      query,
      [audioFileId],
    );
    return audioToolKitFile;
  }

  async isAudioAlreadyPlayed(
    scheduleId: string,
    sessionId: string,
    audioFileId: string,
  ): Promise<boolean> {
    const query = `SELECT * FROM played_audio_toolkit_audio_files WHERE schedule_id=$1 AND session_id=$2 AND audio_file_id=$3;`;
    const audioToolKitFile = await this.database.query<AudioToolKitFile>(
      query,
      [scheduleId, sessionId, audioFileId],
    );
    return audioToolKitFile.length > 0;
  }

  async savePlayedAudioToolkitAudioFile(
    input: SavePlayedAudioToolkitAudioFileInput,
  ): Promise<PlayedAudioToolkitAudioFile> {
    const keys = Object.keys(input).join(', ');
    const values = Object.values(input);
    const placeholders = values
      .map((value, index) => `$${index + 1}`)
      .join(', ');
    const query = `INSERT INTO played_audio_toolkit_audio_files (${keys}) VALUES (${placeholders}) RETURNING *;`;
    const [playedAudioToolkitAudioFile] =
      await this.database.query<PlayedAudioToolkitAudioFile>(query, values);
    return playedAudioToolkitAudioFile;
  }
  async updatePlayedAudioToolkitAudioFile(
    input: SavePlayedAudioToolkitAudioFileInput,
  ): Promise<PlayedAudioToolkitAudioFile> {
    const { schedule_id, session_id, audio_file_id, consumed_duration } = input;
    const query = `UPDATE played_audio_toolkit_audio_files SET consumed_duration= $1 WHERE schedule_id=$2 AND session_id=$3 AND audio_file_id=$4 RETURNING *`;
    const [result] = await this.database.query<PlayedAudioToolkitAudioFile>(
      query,
      [consumed_duration, schedule_id, session_id, audio_file_id],
    );
    return result;
  }

  async getPlayedAudioToolkitFile(
    scheduleId: string,
  ): Promise<PlayedAudioToolkitAudioFile | undefined> {
    const query = `SELECT played_audio_toolkit_audio_files.* FROM played_audio_toolkit_audio_files
       WHERE schedule_id=$1  ORDER BY created_at DESC LIMIT 1;`;
    const [session] = await this.database.query<PlayedAudioToolkitAudioFile>(
      query,
      [scheduleId],
    );
    return session;
  }

  async getAudioToolkitAnswer(
    scheduleId: string,
    sessionId: string,
  ): Promise<AudioToolkitAnswer | undefined> {
    const query = `SELECT audio_tool_kit_answers_table.* FROM audio_tool_kit_answers_table
       WHERE schedule_id=$1 AND session_id = $2 ORDER BY created_at DESC;`;
    const [audioToolkitAnswer] = await this.database.query<AudioToolkitAnswer>(
      query,
      [scheduleId, sessionId],
    );
    return audioToolkitAnswer;
  }

  async getAudioToolkitFilesWithStatus(
    toolkitId: string,
    sessionId: string,
    scheudleId?: string,
  ): Promise<AudioToolkitFileWithStatus[]> {
    const query = `SELECT audio_tool_kit_files.*,
    CASE
      WHEN played_audio_toolkit_audio_files.id IS NOT NULL THEN true
      ELSE false
    END AS is_completed
    FROM audio_tool_kit_files 
    LEFT JOIN played_audio_toolkit_audio_files ON audio_tool_kit_files.id = played_audio_toolkit_audio_files.audio_file_id 
     AND played_audio_toolkit_audio_files.schedule_id = $2
     AND played_audio_toolkit_audio_files.session_id = $3
    WHERE audio_tool_kit_files.tool_kit_id = $1
    ORDER BY audio_tool_kit_files.created_at`;
    const episodeToolkitForms =
      await this.database.query<AudioToolkitFileWithStatus>(query, [
        toolkitId,
        scheudleId,
        sessionId,
      ]);
    return episodeToolkitForms;
  }

  async getUserToolkitById(userToolkitId: string): Promise<UserTookit> {
    const query = `SELECT * FROM user_toolkits WHERE id=$1;`;
    const [data] = await this.database.query<UserTookit>(query, [
      userToolkitId,
    ]);
    return data;
  }

  async insertUserToolkitAnswer(
    userToolkitAnswer: InsertUserToolkitAnswerInput,
  ): Promise<UserTookitAnswer> {
    const keys = Object.keys(userToolkitAnswer);
    const values = Object.values(userToolkitAnswer);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO user_toolkit_answers (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [userTookitAnswer] = await this.database.query<UserTookitAnswer>(
      query,
      values,
    );

    return userTookitAnswer;
  }

  async getUserAppointment(
    id: string,
    userId: string,
  ): Promise<UserAppointmentDetails> {
    const query = `SELECT 
    user_appointments.*,
    ROW_TO_JSON(doctor.*) AS doctor,
     ROW_TO_JSON(users.*) AS users
FROM 
    user_appointments 
LEFT JOIN 
   users AS doctor ON user_appointments.doctor_id = doctor.id
LEFT JOIN 
    users as users ON user_appointments.user_id = users.id
WHERE 
    user_appointments.id = $1 
    AND user_appointments.user_id = $2;
`;
    const [userAppointment] = await this.database.query<UserAppointmentDetails>(
      query,
      [id, userId],
    );
    return userAppointment;
  }

  async getScheduleByScheduleId(id: string): Promise<ScheduleEntity> {
    const query = `SELECT * FROM schedules WHERE id=$1`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [id]);
    return schedule;
  }

  async getAppointmentSession(
    scheduleId: string,
    appointmentId: string,
  ): Promise<UserFormAnswer> {
    const query = `SELECT * FROM user_form_answers WHERE schedule_id=$1 AND user_appointment_id=$2  ORDER BY created_at DESC;`;
    const [session] = await this.database.query<UserFormAnswer>(query, [
      scheduleId,
      appointmentId,
    ]);
    return session;
  }

  async getFormsWithStatus(
    scheduleId: string,
    appointmentId: string,
    sessionDate: string,
    lang: string,
    appointmentSessionId: string,
  ): Promise<FormWithStatus[]> {
    const query = `
    SELECT
   forms.id,
   forms.hlp_reward_points,
   CASE
   WHEN forms.translations->> $4 IS NOT NULL
   THEN (forms.translations->> $4 )::json->>'title'
   ELSE forms.title
 END AS title,
 CASE
 WHEN forms.translations->> $4 IS NOT NULL
 THEN (forms.translations->> $4 )::json->>'description'
 ELSE forms.description
END AS description,
   CASE
      WHEN user_form_answers.id IS NOT NULL THEN true
       ELSE false
   END AS is_completed,
   CASE
        WHEN user_form_answers.id IS NOT NULL THEN user_form_answers.session_id
        ELSE NULL
    END AS session_id
FROM 
   forms
   LEFT JOIN (
   SELECT *
   FROM user_form_answers
   WHERE user_form_answers.schedule_id = $1
   AND user_form_answers.user_appointment_id = $2
     AND user_form_answers.session_date=$3
     AND user_form_answers.appointment_session_id=$5
     )user_form_answers ON user_form_answers.form_id = forms.id
   LEFT JOIN 
   schedules ON schedules.session_form_id= forms.id OR schedules.complaint_form_id= forms.id
WHERE 
  schedules.id =$1
   AND schedules.user_appointment_id = $2
ORDER BY
      forms.created_at DESC
`;

    const appointmentForms = await this.database.query<FormWithStatus>(query, [
      scheduleId,
      appointmentId,
      sessionDate,
      lang,
      appointmentSessionId,
    ]);
    return appointmentForms;
  }

  async getUserAppointmentSchedule(
    id: string,
    userAppointmentId: string,
  ): Promise<GetAppointmentSchedules> {
    const query = `SELECT ROW_TO_JSON(user_appointments.* )AS user_appointment ,ROW_TO_JSON(schedules.*) AS schedule FROM schedules 
    LEFT JOIN user_appointments ON user_appointments.id=schedules.user_appointment_id
     WHERE schedules.id=$1 AND schedules.user_appointment_id=$2`;
    const [schedule] = await this.database.query<GetAppointmentSchedules>(
      query,
      [id, userAppointmentId],
    );
    return schedule;
  }

  async insertUserAppointmentAnswer(
    input: InsertUserAppointmentAnswerInput,
  ): Promise<UserTookitAnswer> {
    const keys = Object.keys(input);
    const values = Object.values(input);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO user_appointment_answers (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [userAppointmentAnswer] = await this.database.query<UserTookitAnswer>(
      query,
      values,
    );

    return userAppointmentAnswer;
  }
  async getTotalEarnedPoint(
    scheduleId: string,
    userId: string,
  ): Promise<number> {
    const query = `SELECT COALESCE(SUM(user_form_answers.hlp_points_earned), 0) AS hlp_points_earned
    FROM user_form_answers
    LEFT JOIN schedules ON schedules.id=user_form_answers.schedule_id 
    WHERE user_form_answers.schedule_id=$1 AND user_form_answers.user_id=$2
    `;
    const [earnedPoint] = await this.database.query<{
      hlp_points_earned: number;
    }>(query, [scheduleId, userId]);
    return earnedPoint.hlp_points_earned;
  }

  async getEarnedPointData(userId: string): Promise<number> {
    const query = `
    SELECT COALESCE(SUM(hlp_points_earned),0) AS earned FROM user_appointment_answers WHERE user_id=$1;
    `;
    const [earnedPoint] = await this.database.query<{
      earned: number;
    }>(query, [userId]);
    return earnedPoint.earned;
  }

  async getAppointmentHistory(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ history: UserAppointmentAnswerHistory[]; total: number }> {
    const offset = (page - 1) * limit;
    const queryWithoutPagination = `SELECT 
    CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM user_appointment_answers 
    WHERE user_appointment_answers.user_id=$1`;
    const query = `
    SELECT ROW_TO_JSON(doctor.*) AS doctor,
    ROW_TO_JSON(users.*) AS users,
    user_appointments.appointment_type,
    user_appointment_answers.feeling,
    user_appointment_answers.session_date,
    user_appointment_answers.session_id,
    user_appointment_answers.schedule_id,
    user_appointment_answers.user_id
    FROM user_appointment_answers
    LEFT JOIN user_appointments ON user_appointments.id=user_appointment_answers.appointment_id
    LEFT JOIN users AS doctor ON user_appointments.doctor_id = doctor.id
    LEFT JOIN users AS users ON user_appointments.user_id = users.id
    WHERE user_appointment_answers.user_id=$1 
    ORDER BY user_appointment_answers.created_at DESC
    LIMIT $2
    OFFSET $3`;
    const [userAppointmentHistory, [{ total }]] = await Promise.all([
      this.database.query<UserAppointmentAnswerHistory>(query, [
        userId,
        limit,
        offset,
      ]),
      this.database.query<{ total: number }>(queryWithoutPagination, [userId]),
    ]);
    return { history: userAppointmentHistory, total };
  }

  async getUserAppointmentCalender(
    userId: string,
    startdate: string,
    endDate: string,
  ): Promise<AnswersHistoryCalenderQueryResult[]> {
    const query = `SELECT session_date::date as day FROM user_appointment_answers
      LEFT JOIN schedules ON user_appointment_answers.schedule_id = schedules.id
      WHERE user_appointment_answers.user_id=$1 
      AND user_appointment_answers.session_date BETWEEN $2 AND $3
      AND schedules.schedule_for = $4
      GROUP BY day
      ORDER BY day`;
    const calender =
      await this.database.query<AnswersHistoryCalenderQueryResult>(query, [
        userId,
        startdate,
        endDate,
        ScheduleFor.APPOINTMENT,
      ]);
    return calender;
  }

  async getFormToolkitDetails(
    scheduleId: string,
    toolkitId: string,
    sessionDate: string,
    lang: string,
  ): Promise<GetFormToolkitDetails> {
    const query = `SELECT
    row_to_json(schedules.*) AS schedule,
    COALESCE(
      (
        SELECT
           row_to_json(tool_kits.*)
        FROM
          (
            SELECT
              tool_kits.*,
              CASE
   WHEN tool_kits.translations->>$4 IS NOT NULL
   THEN (tool_kits.translations->> $4 )::json->>'title'
   ELSE tool_kits.title
 END AS title,
 CASE
 WHEN tool_kits.translations->> $4 IS NOT NULL
 THEN (tool_kits.translations->> $4 )::json->>'description'
 ELSE tool_kits.description
END AS description
            FROM tool_kits 
                  WHERE   tool_kits.id = schedules.tool_kit
          ) AS tool_kits
      ),
      '[]'
    ) AS toolkit,
    COALESCE(
      (
        SELECT
          JSON_AGG(form.*)
        FROM
          (
            SELECT
              forms.id,
              CASE
   WHEN forms.translations->> $4 IS NOT NULL
   THEN (forms.translations->> $4 )::json->>'title'
   ELSE forms.title
 END AS title,
 CASE
 WHEN forms.translations->> $4 IS NOT NULL
 THEN (forms.translations->> $4 )::json->>'description'
 ELSE forms.description
END AS description,
              forms.hlp_reward_points,
              user_form_answers.session_id AS session_id,
              CASE
                WHEN user_form_answers.id IS NOT NULL THEN true
                ELSE false
              END AS is_completed
            FROM
              forms
              LEFT JOIN tool_kit_forms ON tool_kit_forms.form_id = forms.id
              LEFT JOIN (
                SELECT *
                FROM user_form_answers
                WHERE
                           user_form_answers.schedule_id = schedules.id
                           AND user_form_answers.tool_kit_id = schedules.tool_kit
                           AND user_form_answers.session_date::date = $3
                  )user_form_answers ON user_form_answers.form_id = forms.id
                  WHERE   tool_kit_forms.tool_kit_id = schedules.tool_kit
          ) AS form
      ),
      '[]'
    ) AS form_sessions
  FROM
    schedules
    LEFT JOIN tool_kits ON tool_kits.id = schedules.tool_kit
  WHERE
  schedules.id = $1
    AND schedules.tool_kit = $2
  GROUP BY
    schedules.id,
    tool_kits.id`;
    const [formToolkitDetails] =
      await this.database.query<GetFormToolkitDetails>(query, [
        scheduleId,
        toolkitId,
        sessionDate,
        lang,
      ]);
    return formToolkitDetails;
  }

  async getScheduleWithToolkit(
    scheduleId: string,
    userId: string,
  ): Promise<ScheduleWithToolkit> {
    const query = `SELECT schedules.*,row_to_json(tool_kits.*) AS toolkit 
    FROM schedules LEFT JOIN tool_kits ON tool_kits.id=schedules.tool_kit 
    WHERE schedules.id = $1 AND schedules.schedule_for = $2 AND schedules.user = $3`;
    const [scheduleWithToolKitTitle] =
      await this.database.query<ScheduleWithToolkit>(query, [
        scheduleId,
        ScheduleFor.TOOL_KIT,
        userId,
      ]);
    return scheduleWithToolKitTitle;
  }

  async insertToolkitAnswer(
    toolkitAnswer: SaveToolkitAnswerInput,
    toolkitType: ToolkitType,
  ): Promise<ToolkitAnswers> {
    const tableName = toolkitAnswerTables.get(toolkitType);
    if (!tableName) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }

    const keys = Object.keys(toolkitAnswer);
    const values = Object.values(toolkitAnswer);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [tookitAnswer] = await this.database.query<ToolkitAnswers>(
      query,
      values,
    );
    return tookitAnswer;
  }

  async getUserScheduleSessionBySessionDate(
    scheduleId: string,
    sessionDate: string,
  ): Promise<UserScheduleSession[]> {
    const query = `SELECT *  FROM user_schedule_sessions
     WHERE schedule_id= $1 AND session_date = $2`;
    const userScheduleSessions = await this.database.query<UserScheduleSession>(
      query,
      [scheduleId, sessionDate],
    );
    return userScheduleSessions;
  }

  async getLatestToolkitAnswerByScheduleId<T>(
    scheduleId: string,
    toolkitType: ToolkitType,
  ): Promise<T> {
    const tableName = toolkitAnswerTables.get(toolkitType);
    if (!tableName) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }
    const query = `SELECT * FROM ${tableName}
     WHERE schedule_id=$1 ORDER BY created_at DESC LIMIT 1`;
    const [answer] = await this.database.query<T>(query, [scheduleId]);
    return answer;
  }

  private getAllUserFormAnswersQuery(lang: string): string {
    return `SELECT 
  CASE
  WHEN forms.translations->> '${lang}' IS NOT NULL
  THEN (forms.translations->> '${lang}' )::json->>'title'
  ELSE forms.title
  END AS title,
  NULL as emoji,
  user_form_answers.session_date,
  user_form_answers.session_id
  FROM user_form_answers
  LEFT JOIN forms ON user_form_answers.form_id = forms.id
  WHERE  user_form_answers.user_id = $1`;
  }

  private getAllActivityToolkitAnswerQuery(): string {
    return `SELECT  
  CONCAT(activity_tool_kit_answers.consumed_duration) as title,
  activity_tool_kit_answers.feeling as emoji,
  activity_tool_kit_answers.session_date,
  activity_tool_kit_answers.session_id
  FROM  activity_tool_kit_answers WHERE activity_tool_kit_answers.user_id = $1`;
  }

  private getAllStepToolkitAnswerQuery(): string {
    return `  SELECT  
CONCAT(steps_tool_kit_answers.steps) as title,
steps_tool_kit_answers.feeling as emoji,
steps_tool_kit_answers.session_date,
steps_tool_kit_answers.session_id
FROM steps_tool_kit_answers WHERE steps_tool_kit_answers.user_id = $1`;
  }

  private getAllMedicationToolkitAnswerQuery(): string {
    return `SELECT
  CONCAT(medication_tool_kit_answers.name, ' (', medication_tool_kit_answers.doses, ')') as title,
  medication_tool_kit_answers.feeling as emoji,
  medication_tool_kit_answers.session_date,
  medication_tool_kit_answers.session_id
  FROM medication_tool_kit_answers WHERE medication_tool_kit_answers.user_id=$1`;
  }

  private getAllSleepCheckToolkitAnswerQuery(): string {
    return `SELECT  
  CONCAT(sleep_check_tool_kit_answers.total_sleep_time) as title,
  sleep_check_tool_kit_answers.quality_of_sleep as emoji,
  sleep_check_tool_kit_answers.session_date,
  sleep_check_tool_kit_answers.session_id
  FROM sleep_check_tool_kit_answers WHERE sleep_check_tool_kit_answers.user_id = $1`;
  }

  private getAllAlcohalIntakeToolkitAnswerQuery(): string {
    return ` SELECT  
  CONCAT(alcohol_intake_tool_kit_answers.doses) as title,
  alcohol_intake_tool_kit_answers.feeling as emoji,
  alcohol_intake_tool_kit_answers.session_date,
  alcohol_intake_tool_kit_answers.session_id
 FROM alcohol_intake_tool_kit_answers WHERE alcohol_intake_tool_kit_answers.user_id = $1`;
  }

  private getAllBloodPressureToolkitAnswerQuery(): string {
    return `SELECT  
  CONCAT(blood_pressure_tool_kit_answers.lowest_bp, '-',blood_pressure_tool_kit_answers.highest_bp) as title,
  blood_pressure_tool_kit_answers.feeling as emoji,
  blood_pressure_tool_kit_answers.session_date,
  blood_pressure_tool_kit_answers.session_id
  FROM blood_pressure_tool_kit_answers WHERE blood_pressure_tool_kit_answers.user_id = $1`;
  }

  private getAllDrinkWaterToolkitAnswerQuery(lang: string): string {
    return `SELECT  
  CASE
  WHEN tool_kits.translations->> '${lang}' IS NOT NULL
  THEN (tool_kits.translations->> '${lang}' )::json->>'title'
  ELSE tool_kits.title
  END AS title,
  drink_water_tool_kit_answers.feeling as emoji,
  drink_water_tool_kit_answers.session_date,
  drink_water_tool_kit_answers.session_id
  FROM drink_water_tool_kit_answers
 LEFT JOIN tool_kits ON tool_kits.id=drink_water_tool_kit_answers.tool_kit_id
 WHERE drink_water_tool_kit_answers.user_id = $1`;
  }

  private getAllEcgToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(ecg_tool_kit_answers.spm) as title,
    ecg_tool_kit_answers.feeling as emoji,
    ecg_tool_kit_answers.session_date,
    ecg_tool_kit_answers.session_id
    FROM ecg_tool_kit_answers WHERE ecg_tool_kit_answers.user_id = $1`;
  }

  private getAllToolkitEpisodeAnswerQuery(lang: string): string {
    return `SELECT  
    CASE
    WHEN tool_kits.translations->> '${lang}' IS NOT NULL
    THEN (tool_kits.translations->> '${lang}' )::json->>'title'
    ELSE tool_kits.title
    END AS title,
    NULL as emoji,
    tool_kit_episodes_answers.session_date,
    tool_kit_episodes_answers.session_id
    FROM tool_kit_episodes_answers
    LEFT JOIN tool_kits ON tool_kits.id = tool_kit_episodes_answers.tool_kit_id
    WHERE tool_kit_episodes_answers.user_id = $1`;
  }

  private getAllHabitToolkitAnswerQuery(lang: string): string {
    return `SELECT  
 CASE
 WHEN tool_kits.translations->> '${lang}' IS NOT NULL
 THEN (tool_kits.translations->> '${lang}' )::json->>'title'
 ELSE tool_kits.title
 END AS title,
 NULL as emoji,
 habit_tool_kit_answers.session_date,
 habit_tool_kit_answers.session_id
 FROM habit_tool_kit_answers
 LEFT JOIN tool_kits ON tool_kits.id = habit_tool_kit_answers.tool_kit_id
 WHERE habit_tool_kit_answers.user_id = $1`;
  }

  private getAllHeartRateToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(heart_rate_tool_kit_answers.average_heart_rate) as title,
    heart_rate_tool_kit_answers.feeling as emoji,
    heart_rate_tool_kit_answers.session_date,
    heart_rate_tool_kit_answers.session_id
    FROM heart_rate_tool_kit_answers WHERE heart_rate_tool_kit_answers.user_id = $1`;
  }
  private getAllMeditationToolkitAnswerQuery(): string {
    return `SELECT
    CONCAT(meditation_tool_kit_answers.consumed_duration) as title,
    meditation_tool_kit_answers.feeling as emoji,
    meditation_tool_kit_answers.session_date,
    meditation_tool_kit_answers.session_id
    FROM meditation_tool_kit_answers WHERE meditation_tool_kit_answers.user_id = $1`;
  }

  private getAllPodcastToolkitAnswerQuery(): string {
    return `SELECT
     CONCAT(podcast_tool_kit_answers.consumed_duration) as title,
    podcast_tool_kit_answers.feeling as emoji,
    podcast_tool_kit_answers.session_date,
    podcast_tool_kit_answers.session_id
    FROM podcast_tool_kit_answers WHERE podcast_tool_kit_answers.user_id = $1`;
  }

  private getAllRunningToolkitAnswerQuery(lang: string): string {
    return `SELECT  
    CASE
    WHEN tool_kits.translations->> '${lang}' IS NOT NULL
    THEN (tool_kits.translations->> '${lang}' )::json->>'title'
    ELSE tool_kits.title
    END AS title,
    running_tool_kit_answers.feeling as emoji,
    running_tool_kit_answers.session_date,
    running_tool_kit_answers.session_id
    FROM 
    running_tool_kit_answers
    LEFT JOIN tool_kits ON tool_kits.id = running_tool_kit_answers.tool_kit_id
    WHERE running_tool_kit_answers.user_id = $1`;
  }

  private getAllSportToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(sports_tool_kit_answers.duration) AS title,
    sports_tool_kit_answers.feeling as emoji,
    sports_tool_kit_answers.session_date,
    sports_tool_kit_answers.session_id
    FROM 
    sports_tool_kit_answers WHERE sports_tool_kit_answers.user_id = $1`;
  }

  private getAllVideoToolkitAnswerQuery(lang: string): string {
    return ` SELECT  
    CASE
    WHEN tool_kits.translations->> '${lang}' IS NOT NULL
    THEN (tool_kits.translations->> '${lang}' )::json->>'title'
    ELSE tool_kits.title
    END AS title,
    video_tool_kit_answers.feeling as emoji,
    video_tool_kit_answers.session_date,
    video_tool_kit_answers.session_id
    FROM 
    video_tool_kit_answers
    LEFT JOIN tool_kits ON tool_kits.id = video_tool_kit_answers.tool_kit_id
    WHERE video_tool_kit_answers.user_id = $1`;
  }

  private getAllWeightIntakeToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(weight_intake_tool_kit_answers.weight,'kg') AS title,
    weight_intake_tool_kit_answers.feeling as emoji,
    weight_intake_tool_kit_answers.session_date,
    weight_intake_tool_kit_answers.session_id
    FROM weight_intake_tool_kit_answers WHERE weight_intake_tool_kit_answers.user_id = $1`;
  }

  private getAllAudioToolkitAnswerQuery(lang: string): string {
    return ` SELECT  
    CASE
    WHEN tool_kits.translations->> '${lang}' IS NOT NULL
    THEN (tool_kits.translations->> '${lang}' )::json->>'title'
    ELSE tool_kits.title
    END AS title,
    audio_tool_kit_answers_table.feeling as emoji,
    audio_tool_kit_answers_table.session_date,
    audio_tool_kit_answers_table.session_id
    FROM 
    audio_tool_kit_answers_table
    LEFT JOIN tool_kits ON tool_kits.id = audio_tool_kit_answers_table.tool_kit_id
    WHERE audio_tool_kit_answers_table.user_id = $1`;
  }

  private getAllVitalTookitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(vitals_tool_kit_answers.diastolic_value,'-',vitals_tool_kit_answers.systolic_value) AS title,
    vitals_tool_kit_answers.feeling as emoji,
    vitals_tool_kit_answers.session_date,
    vitals_tool_kit_answers.session_id
    FROM vitals_tool_kit_answers WHERE vitals_tool_kit_answers.user_id = $1`;
  }

  private getAllMoodToolkitAnswerQuery(lang: string): string {
    return ` SELECT  
    CASE
    WHEN tool_kits.translations->> '${lang}' IS NOT NULL
    THEN (tool_kits.translations->> '${lang}' )::json->>'title'
    ELSE tool_kits.title
    END AS title,
    NULL as emoji,
    mood_tool_kit_answers.session_date,
    mood_tool_kit_answers.session_id
    FROM 
    mood_tool_kit_answers
    LEFT JOIN tool_kits ON tool_kits.id = mood_tool_kit_answers.tool_kit_id
    WHERE mood_tool_kit_answers.user_id = $1`;
  }

  private getAllAddictionLogToolkitAnswerQuery(lang: string): string {
    return ` SELECT  
    CASE
    WHEN tool_kits.translations->> '${lang}' IS NOT NULL
    THEN (tool_kits.translations->> '${lang}' )::json->>'title'
    ELSE tool_kits.title
    END AS title,
    addiction_log_tool_kit_answers.feeling as emoji,
    addiction_log_tool_kit_answers.session_date,
    addiction_log_tool_kit_answers.session_id
    FROM 
    addiction_log_tool_kit_answers
    LEFT JOIN tool_kits ON tool_kits.id = addiction_log_tool_kit_answers.tool_kit_id
    WHERE addiction_log_tool_kit_answers.user_id = $1`;
  }

  private getAllSymptomLogToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(symptoms_log_tool_kit_answers.symptom_level) AS title,
     symptoms_log_tool_kit_answers.feeling as emoji,
     symptoms_log_tool_kit_answers.session_date,
     symptoms_log_tool_kit_answers.session_id
     FROM symptoms_log_tool_kit_answers WHERE symptoms_log_tool_kit_answers.user_id = $1
    `;
  }

  private getAllEmotionSymptomLogToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(emotion_symptoms_log_tool_kit_answers.emotion_symptom_level) AS title,
     emotion_symptoms_log_tool_kit_answers.feeling as emoji,
     emotion_symptoms_log_tool_kit_answers.session_date,
     emotion_symptoms_log_tool_kit_answers.session_id
     FROM emotion_symptoms_log_tool_kit_answers WHERE emotion_symptoms_log_tool_kit_answers.user_id = $1`;
  }
  private getAllAnxietySymptomLogToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(anxiety_symptoms_log_tool_kit_answers.anxiety_symptom_level) AS title,
     anxiety_symptoms_log_tool_kit_answers.feeling as emoji,
     anxiety_symptoms_log_tool_kit_answers.session_date,
     anxiety_symptoms_log_tool_kit_answers.session_id
     FROM anxiety_symptoms_log_tool_kit_answers WHERE anxiety_symptoms_log_tool_kit_answers.user_id = $1`;
  }

  private getAllSuspiciusSymptomToolkitAnswerQuery(): string {
    return `
    SELECT  
    CONCAT(suspicius_symptoms_log_tool_kit_answers.suspicius_symptom_level) AS title,
     suspicius_symptoms_log_tool_kit_answers.feeling as emoji,
     suspicius_symptoms_log_tool_kit_answers.session_date,
     suspicius_symptoms_log_tool_kit_answers.session_id
     FROM suspicius_symptoms_log_tool_kit_answers WHERE suspicius_symptoms_log_tool_kit_answers.user_id = $1`;
  }

  private getAllHyperActivitySymptomToolkitAnswerQuery(): string {
    return `SELECT  
    CONCAT(hyper_activity_symptoms_log_tool_kit_answers.hyper_activity_symptom_level) AS title,
    hyper_activity_symptoms_log_tool_kit_answers.feeling as emoji,
    hyper_activity_symptoms_log_tool_kit_answers.session_date,
    hyper_activity_symptoms_log_tool_kit_answers.session_id
    FROM hyper_activity_symptoms_log_tool_kit_answers WHERE hyper_activity_symptoms_log_tool_kit_answers.user_id = $1`;
  }

  private getAllForcedActionSymptomToolkitAnswerQuery(): string {
    return ` SELECT  
    CONCAT(forced_action_symptoms_log_tool_kit_answers.forced_action_symptom_level) AS title,
    forced_action_symptoms_log_tool_kit_answers.feeling as emoji,
    forced_action_symptoms_log_tool_kit_answers.session_date,
    forced_action_symptoms_log_tool_kit_answers.session_id
    FROM forced_action_symptoms_log_tool_kit_answers WHERE forced_action_symptoms_log_tool_kit_answers.user_id = $1`;
  }
  //Get All toolkit History
  private getAllToolkitsHistoryQuery(lang: string): string {
    return ` ${this.getAllUserFormAnswersQuery(lang)}

      UNION

      ${this.getAllActivityToolkitAnswerQuery()}

     UNION
      
      ${this.getAllStepToolkitAnswerQuery()}

      UNION 

      ${this.getAllMedicationToolkitAnswerQuery()}
      
      UNION

     ${this.getAllSleepCheckToolkitAnswerQuery()}

     UNION
     ${this.getAllAlcohalIntakeToolkitAnswerQuery()}    

    UNION
   ${this.getAllBloodPressureToolkitAnswerQuery()}

   UNION
   ${this.getAllDrinkWaterToolkitAnswerQuery(lang)}

  UNION
 ${this.getAllEcgToolkitAnswerQuery()}

 UNION
 ${this.getAllToolkitEpisodeAnswerQuery(lang)}

 UNION
 ${this.getAllHabitToolkitAnswerQuery(lang)}

 UNION
${this.getAllHeartRateToolkitAnswerQuery()}

 UNION

 ${this.getAllMeditationToolkitAnswerQuery()}

 UNION

${this.getAllPodcastToolkitAnswerQuery()}

 UNION
 ${this.getAllRunningToolkitAnswerQuery(lang)}

 UNION
${this.getAllSportToolkitAnswerQuery()}

 UNION
${this.getAllVideoToolkitAnswerQuery(lang)}

 UNION
${this.getAllWeightIntakeToolkitAnswerQuery()}

 UNION
${this.getAllAudioToolkitAnswerQuery(lang)}
     
 UNION
${this.getAllVitalTookitAnswerQuery()}

 UNION
${this.getAllMoodToolkitAnswerQuery(lang)}

 UNION
${this.getAllAddictionLogToolkitAnswerQuery(lang)}

 UNION
${this.getAllSymptomLogToolkitAnswerQuery()}
 UNION
${this.getAllEmotionSymptomLogToolkitAnswerQuery()}

 UNION
${this.getAllAnxietySymptomLogToolkitAnswerQuery()}

 UNION
${this.getAllSuspiciusSymptomToolkitAnswerQuery()}
 
 UNION
 ${this.getAllHyperActivitySymptomToolkitAnswerQuery()}
 
 UNION
${this.getAllForcedActionSymptomToolkitAnswerQuery()}
 `;
  }

  async getAllToolkitsHistory(
    userId: string,
    page: number,
    limit: number,
    lang: string,
  ): Promise<{ allToolkitsHistory: GetAllToolkitsHistory[]; total: number }> {
    const offset = (page - 1) * limit;
    const queryWithoutPagination = ` SELECT 
    CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total 
    FROM (
     ${this.getAllToolkitsHistoryQuery(lang)}
    ) AS allToolkitsCount`;

    const query = `SELECT * FROM (
    ${this.getAllToolkitsHistoryQuery(lang)}
     ) AS allToolkitsHistory
     ORDER BY session_date DESC
     LIMIT $2 OFFSET $3`;
    const [toolkitsHistory, [{ total }]] = await Promise.all([
      this.database.query<GetAllToolkitsHistory>(query, [
        userId,
        limit,
        offset,
      ]),
      this.database.query<{ total: number }>(queryWithoutPagination, [userId]),
    ]);
    return { allToolkitsHistory: toolkitsHistory, total };
  }
}
