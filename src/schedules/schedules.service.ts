import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AddReminderBodyDto,
  BlogType,
  Challenge,
  DashboardBlog,
  DashboardChallenge,
  Schedule,
  ScheduleReminderDto,
} from './schedules.dto';
import { SchedulesRepo } from './schedules.repo';
import { DateTime } from 'luxon';
import { SchedulesReminderSevice } from './schedules-reminder.service';
import { UtilsService } from '../utils/utils.service';
import {
  UpdateScheduleRemindersArgs,
  UpdateScheduleRemindersResponse,
} from './schedules.model';
import { RobotsService } from '../robots/robots.service';
import {
  GetDashBoardResponse,
  GetDashboardArgs,
  ScheduleWithAnswers,
  ToolkitWithUnit,
  UserSchedule,
  UserScheduleEntry,
} from './dto/get-dashboard.dto';
import {
  BloodPressureToolkitAnswers,
  HeartRateToolkitAnswers,
  MedicationToolkitAnswers,
  SleepCheckToolkitAnswers,
  StepsToolkitAnswers,
  Toolkit,
  ToolkitAnswers,
  ToolkitOptions,
  ToolkitType,
  WeightIntakeToolkitAnswers,
  toolkitAnswerTables,
} from '../toolkits/toolkits.model';
import {
  AddictionLogs,
  AnxietySymptomsLogs,
  BloodPressureLogs,
  EmotionSymptomsLogs,
  ForcedActionSymptomsLogs,
  HeartRateLogs,
  HyperActivitySymptomsLogs,
  MedicationLogs,
  MoodLogs,
  SleepLogs,
  StepsLogs,
  SuspiciusSymptomsLogs,
  SymptomsLogs,
  WeightLogs,
} from '../checkins/dto/checkin-logs.dto';
import {
  GetUserAgendaArgs,
  GetUserAgendaResponse,
} from './dto/get-user-agenda.dto';
import { MoodToolkitAnswer } from '../toolkits/entities/mood-toolkit-answer.entity';
import { MoodCheckCategory } from '../user-mood-checks/entities/mood-check-category.entity';
import {
  ScheduleType,
  ScheduleEntity,
  ScheduleFor,
} from './entities/schedule.entity';
import {
  GetUserHabitsResponse,
  HabitScheduleWithAnswers,
  UserHabit,
} from './dto/get-user-habits.dto';
import { DisableScheduleArgs } from './dto/disable-schedule.dto';
import { UserGoalLevels } from '../goals/goals.model';
import {
  CreateScheduleInput,
  CreateScheduleResponse,
  MedicationInfoInput,
  SaveScheduleInput,
  SaveToolkitOptionsInput,
  SaveUserAppointmentInput,
  SaveUserToolkitInput,
  ScheduleToolkitOptions,
  ScheduleToolkitPlan,
  toolkitsWithSelectOption,
  validScheduleDays,
} from './dto/create-schedule.dto';
import { ScheduleReminder } from './entities/schedule-reminder.entity';
import { RobotPageType } from '../robots/entities/robot.entity';
import { ChannelsRepo } from '../channels/channels.repo';
import { GetToolkitResultResponse } from './dto/get-toolkit-result.dto';
import {
  HandleScheduleUpdateBody,
  HandleScheduleUpdateResponse,
} from './dto/handle-schedule-update.dto';
import { GetScheduleResponse } from './dto/get-schedule.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { toolkitOptionTableInfo } from '../toolkits/dto/toolkits.dto';
import { GetPatientAgendaArgs } from './dto/get-patient-agenda.dto';
import { SymptomsLogToolkitAnswer } from '@toolkits/entities/symptoms-log-toolkit-answer.entity';
import { AddictionLogToolkitAnswer } from '@toolkits/entities/addiction-log-toolkit-answer.entity';
import { ScheduleAddedEvent, ScheduleEvent } from './schedule.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CalenderAgenda,
  UserCalenderSchedule,
  DateWithSchedules,
  GetUserCalenderAgendaArgs,
  GetUserCalenderAgendaResponse,
  SchedulesWithSessions,
  HabitSchedulesWithSessions,
} from './dto/get-user-calender-agenda.dto';
import { UserScheduleSession } from 'src/schedule-sessions/entities/user-schedule-sessions.entity';
import { ulid } from 'ulid';
import { AgeGroups, UserRoles } from '@users/users.dto';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import { AgendaFilter } from './dto/get-doctor-calender-agenda.dto';
import { HabitToolDeletedFromAgenda } from './entities/habit_tools_delete_from_agenda.entity';
import {
  UpdateMedicationInfoInput,
  UpdateScheduleInput,
  UpdateScheduleResponse,
  UpdateSchedulesInput,
  UpdateToolkitOptionsInput,
  UpdateUserAppointmentInput,
} from './dto/update-schedule.dto';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { UserTookit } from '@toolkits/entities/user-toolkits.entity';
import { EmotionSymptomsLogToolkitAnswer } from '@toolkits/entities/emotion-symptoms-log-toolkit-answer.entity';
import { AnxietySymptomsLogToolkitAnswer } from '@toolkits/entities/anxiety-symptoms-log-toolkit-answer.entity';
import { SuspiciusSymptomsLogToolkitAnswer } from '@toolkits/entities/suspicius-symptoms-log-toolkit-answer.entity';
import { ForcedActionSymptomsLogToolkitAnswer } from '@toolkits/entities/forced-action-symptoms-log-toolkit-answer.entity';
import { HyperActivitySymptomsLogToolkitAnswer } from '@toolkits/entities/hyper-activity-symptoms-log-toolkit-answer.entity';

@Injectable()
export class SchedulesService {
  private logger = new Logger(SchedulesService.name);
  constructor(
    private readonly schedulesRepo: SchedulesRepo,
    private readonly reminderService: SchedulesReminderSevice,
    private readonly utilsService: UtilsService,
    private readonly robotsService: RobotsService,
    private readonly channelsRepo: ChannelsRepo,
    private readonly translationService: TranslationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  private mapChallenges(challenges: Challenge[]): DashboardChallenge[] {
    const mappedChallenges = challenges.map((challenge) => {
      const newChallenge: DashboardChallenge = {
        id: challenge.id,
        tool_kit_id: challenge.tool_kit_id,
        short_description: challenge.short_description,
        image_url: challenge.image_url,
        title: challenge.title,
        tool_kit_category: challenge.tool_kit.tool_kit_category,
        tool_kit_type: challenge.tool_kit.tool_kit_type,
        created_at: challenge.created_at,
        file_path: challenge.file_path,
      };
      return newChallenge;
    });
    return mappedChallenges;
  }

  private prepareToolkitAnswers(
    toolkitType: string,
    answers: ToolkitAnswers[],
    unit: string,
  ): UserScheduleEntry[] {
    if (toolkitType === ToolkitType.MEDICATION) {
      return this.prepareMedicationAnwers(answers, unit);
    }
    if (toolkitType === ToolkitType.SLEEP_CHECK) {
      return this.prepareSleepCheckToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.HEART_RATE) {
      return this.prepareHeareRateToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.BLOOD_PRESSURE) {
      return this.prepareBloodPressureToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.STEPS) {
      return this.prepareStepsToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.MOOD) {
      return this.prepareMoodToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.WEIGHT) {
      return this.prepareWightToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.ADDICTION_LOG) {
      return this.prepareAddictionLogToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.SYMPTOMS_LOG) {
      return this.prepareSymptomsLogToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.EMOTION_SYMPTOMS_LOG) {
      return this.prepareEmotionSymptomsLogToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.ANXIETY_SYMPTOMS_LOG) {
      return this.prepareAnxietySymptomsLogToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.SUSPICIUS_SYMPTOMS_LOG) {
      return this.prepareSuspiciusSymptomsLogToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.FORCED_ACTION_SYMPTOMS_LOG) {
      return this.prepareForcedActionSymptomsLogToolkitAnswers(answers);
    }
    if (toolkitType === ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG) {
      return this.prepareHyperActivitySymptomsLogToolkitAnswers(answers);
    }
    return [];
  }

  private prepareAddictionLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): AddictionLogs[] {
    const logs: AddictionLogs[] = answers.map((data) => {
      const answer = data as AddictionLogToolkitAnswer;
      return {
        addiction_log_answer: answer.addiction_log_answer,
        days_without_addiction: answer.days_without_addiction,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareSymptomsLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): SymptomsLogs[] {
    const logs: SymptomsLogs[] = answers.map((data) => {
      const answer = data as SymptomsLogToolkitAnswer;
      return {
        symptom_level: answer.symptom_level,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareMoodToolkitAnswers(answers: ToolkitAnswers[]): MoodLogs[] {
    const logs: MoodLogs[] = answers.map((data) => {
      const { answer, mood_check_category } = data as unknown as {
        answer: MoodToolkitAnswer;
        mood_check_category: MoodCheckCategory;
      };
      return {
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        sessionId: answer.session_id ? answer.session_id : '',
        mood_category_id: answer.mood_category_id,
        mood_category_file_path: mood_check_category.file_path,
        mood_category_background_colour: mood_check_category.background_colour,
      };
    });
    return logs;
  }

  private prepareMedicationAnwers(
    answers: ToolkitAnswers[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unit?: string,
  ): MedicationLogs[] {
    const logs: MedicationLogs[] = answers.map((data) => {
      const answer = data as MedicationToolkitAnswers;
      return {
        medication: `${answer.doses}`,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
        isCompleted: true,
      };
    });
    return logs;
  }

  private prepareWightToolkitAnswers(answers: ToolkitAnswers[]): WeightLogs[] {
    const logs: WeightLogs[] = answers.map((data) => {
      const answer = data as WeightIntakeToolkitAnswers;
      return {
        weight: answer.weight,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareStepsToolkitAnswers(answers: ToolkitAnswers[]): StepsLogs[] {
    const logs: StepsLogs[] = answers.map((data) => {
      const answer = data as StepsToolkitAnswers;
      return {
        steps: answer.steps,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareBloodPressureToolkitAnswers(
    answers: ToolkitAnswers[],
  ): BloodPressureLogs[] {
    const logs: BloodPressureLogs[] = answers.map((data) => {
      const answer = data as BloodPressureToolkitAnswers;
      return {
        higestBp: answer.highest_bp,
        lowestBp: answer.lowest_bp,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareHeareRateToolkitAnswers(
    answers: ToolkitAnswers[],
  ): HeartRateLogs[] {
    const logs: HeartRateLogs[] = answers.map((data) => {
      const answer = data as HeartRateToolkitAnswers;
      return {
        heartRate: answer.average_heart_rate,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareSleepCheckToolkitAnswers(
    answers: ToolkitAnswers[],
  ): SleepLogs[] {
    const logs: SleepLogs[] = answers.map((data) => {
      const answer = data as SleepCheckToolkitAnswers;
      return {
        sleepTime: this.utilsService.convertMinutesToHoursAndMinutes(
          answer.total_sleep_time,
        ),
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.quality_of_sleep,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareEmotionSymptomsLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): EmotionSymptomsLogs[] {
    const logs: EmotionSymptomsLogs[] = answers.map((data) => {
      const answer = data as EmotionSymptomsLogToolkitAnswer;
      return {
        emotion_symptom_level: answer.emotion_symptom_level,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareAnxietySymptomsLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): AnxietySymptomsLogs[] {
    const logs: AnxietySymptomsLogs[] = answers.map((data) => {
      const answer = data as AnxietySymptomsLogToolkitAnswer;
      return {
        anxiety_symptom_level: answer.anxiety_symptom_level,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareSuspiciusSymptomsLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): SuspiciusSymptomsLogs[] {
    const logs: SuspiciusSymptomsLogs[] = answers.map((data) => {
      const answer = data as SuspiciusSymptomsLogToolkitAnswer;
      return {
        suspicius_symptom_level: answer.suspicius_symptom_level,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareForcedActionSymptomsLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): ForcedActionSymptomsLogs[] {
    const logs: ForcedActionSymptomsLogs[] = answers.map((data) => {
      const answer = data as ForcedActionSymptomsLogToolkitAnswer;
      return {
        forced_action_symptom_level: answer.forced_action_symptom_level,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareHyperActivitySymptomsLogToolkitAnswers(
    answers: ToolkitAnswers[],
  ): HyperActivitySymptomsLogs[] {
    const logs: HyperActivitySymptomsLogs[] = answers.map((data) => {
      const answer = data as HyperActivitySymptomsLogToolkitAnswer;
      return {
        hyper_activity_symptom_level: answer.hyper_activity_symptom_level,
        sessionTime: this.utilsService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return logs;
  }

  private prepareBlogpost(
    blogpost: DashboardBlog[],
    userOrder: number,
  ): DashboardBlog[] {
    const dailyBoostBlogPosts = blogpost.filter((post) => {
      return (
        post.blog_type === BlogType.DAILY_BOOST && post.show_order === userOrder
      );
    });
    const dailyBoostSort = dailyBoostBlogPosts.sort(
      (a, b) => Number(a.show_order) - Number(b.show_order),
    );
    const otherBlogPosts = blogpost.filter((post) => {
      return post.blog_type !== BlogType.DAILY_BOOST;
    });
    const sortedBlogposts = [...dailyBoostSort, ...otherBlogPosts];
    return sortedBlogposts;
  }

  private getUserDailyBoostBlogOrder(
    registartionDate: string,
    date: string,
  ): number {
    const currentDate = DateTime.fromJSDate(new Date(date))
      .toUTC()
      .startOf('day');
    const regestrationDate = DateTime.fromISO(registartionDate)
      .toUTC()
      .startOf('day');
    const { days } = currentDate.diff(regestrationDate, ['days']).toObject();
    if (!days || days <= 0) {
      return 1;
    }
    return days + 1;
  }

  private getDatesByScheduleType(
    scheduleType: ScheduleType,
    dateString: string,
  ): { startDate: string; endDate: string } {
    const date = DateTime.fromISO(dateString);
    const endDate = date.endOf('day');
    let startDate = date.startOf('day');
    const isWeekly = scheduleType === ScheduleType.WEEKLY;
    const isDaily = scheduleType === ScheduleType.DAILY;
    const isMonthly = scheduleType === ScheduleType.MONTHLY;
    if (isWeekly || isDaily) {
      startDate = date.startOf('week');
    }
    if (isMonthly) {
      startDate = date.startOf('month');
    }
    return {
      startDate: startDate.toISODate() as string,
      endDate: endDate.toISODate() as string,
    };
  }

  async getToolkitResult(
    scheduleId: string,
    dateString: string,
    userId: string,
  ): Promise<GetToolkitResultResponse> {
    const schedule = await this.schedulesRepo.getSchedule(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }
    const { startDate, endDate } = this.getDatesByScheduleType(
      schedule.schedule_type,
      dateString,
    );
    const toolKit = schedule.toolkit;
    const toolkitAnswerTableName = toolkitAnswerTables.get(
      toolKit.tool_kit_type,
    );
    if (!toolkitAnswerTableName) {
      throw new NotFoundException(`schedules.toolkit_not_found`);
    }
    const [sessions] = await Promise.all([
      this.schedulesRepo.getUserScheduleSessionsByDateRange(
        scheduleId,
        startDate,
        endDate,
        toolkitAnswerTableName,
      ),
    ]);
    let goalLevel: UserGoalLevels | undefined;
    const userGoal = await this.schedulesRepo.getUserGoalByGoal(
      userId,
      toolKit.goal_id,
    );
    if (userGoal) {
      const goalLevels = await this.schedulesRepo.getUserGoalLevelsByGoalId(
        userId,
        toolKit.goal_id,
      );
      if (goalLevels.length) {
        const currentGoalLevel = goalLevels.find(
          (goalLevel) => goalLevel.is_completed,
        );
        if (currentGoalLevel) {
          goalLevel = currentGoalLevel;
        }
      }
    }
    if (!userGoal) {
      this.logger.log(`The ${toolKit.title} is not in user goals`);
    }
    const targetType = this.utilsService.getTarget(
      { ...schedule, user_schedule_sessions: sessions },
      dateString,
    );
    const defaultChannel = await this.channelsRepo.getDefaultChannel();
    const data = {
      title: toolKit.title,
      gif: toolKit.tool_kit_result_screen_image,
      hlp_points: toolKit.tool_kit_hlp_reward_points,
      ...targetType,
      goal_level: goalLevel?.title,
      goal_name: goalLevel?.goal_title,
      default_channel: defaultChannel || null,
    };
    return data;
  }

  /**
   * @description Theis service are used in  @function checkSchedule() function  in the schedules controller,CHECK_SCHEDULE is used in the schedules processor to mark one-time schedules as completed.
   */
  async checkSchedule(id: string): Promise<void> {
    const schedule = await this.schedulesRepo.getScheduleById<Schedule>(id);
    if (!schedule) {
      throw new NotFoundException(
        `${this.translationService.translate(
          'schedules.schedule_with_id',
        )} ${id} ${this.translationService.translate('schedules.not_found')}`,
      );
    }
    if (schedule.schedule_type !== ScheduleType.ONE_TIME) {
      this.logger.log(`Schedule is ${schedule.schedule_type}`);
      return;
    }
    const updatedSchedule = await this.schedulesRepo.completeSchedule(id);
    this.logger.log(
      `${id} schedule is completed ${JSON.stringify(updatedSchedule)}`,
    );
  }

  async getScheduleDetails(id: string): Promise<Schedule> {
    const schedule = await this.schedulesRepo.getScheduleById<Schedule>(id);
    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }
    return schedule;
  }

  async addReminder(body: AddReminderBodyDto): Promise<void> {
    const { data: reminder } = body;
    const { schedule_id: scheduleId } = reminder;
    const schedule = await this.schedulesRepo.getSchedule(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }
    await this.reminderService.addScheduleReminders(schedule, [reminder]);
  }

  async updateScheduleReminders(
    userId: string,
    args: UpdateScheduleRemindersArgs,
  ): Promise<UpdateScheduleRemindersResponse> {
    const { scheduleId, reminders } = args;
    const schedule = await this.schedulesRepo.getSchedule(scheduleId);
    if (!schedule) {
      throw new NotFoundException();
    }
    const newReminders = reminders.map((reminder) => {
      const newReminder: ScheduleReminderDto = {
        reminder_time: reminder,
        schedule_id: scheduleId,
        user_id: userId,
      };
      return newReminder;
    });

    const deletedReminders = await this.schedulesRepo.deleteScheduleReminders(
      scheduleId,
    );
    if (deletedReminders.length) {
      await this.reminderService.removeScheduleReminders(
        schedule,
        deletedReminders,
      );
    }

    if (reminders.length) {
      const addedReminders = await this.schedulesRepo.addScheduleReminders(
        newReminders,
      );
      await this.reminderService.addScheduleReminders(schedule, addedReminders);
    }

    const affectedRows = reminders.length
      ? reminders.length
      : deletedReminders.length;
    return {
      affectedRows,
    };
  }

  private mapUserSchedule(schedule: ScheduleWithAnswers): UserSchedule {
    const {
      entries: answers,
      reminders,
      challenge,
      toolkit: toolkitData,
      ...mappedSchedule
    } = schedule;

    let toolkit = null;

    if (toolkitData) {
      [toolkit] = this.translationService.getTranslations<ToolkitWithUnit>(
        [toolkitData],
        ['title', 'tool_description', 'tool_type_text'],
      );
    }

    const userToolkitPoints = 1; // default points for user toolkit
    const points =
      schedule.schedule_for === ScheduleFor.USER_TOOLKIT
        ? userToolkitPoints
        : toolkit?.tool_kit_hlp_reward_points;

    //translation is used for app team only, for coach website they translate it in the front end
    mappedSchedule.user_appointment_title = schedule?.user_appointment_title
      ? this.translationService.translate(
          `appointment.type.${schedule.user_appointment_title}`,
        )
      : undefined;

    const newSchedule: UserSchedule = {
      tool_kit_category: toolkit?.tool_kit_category,
      tool_kit_type: toolkit?.tool_kit_type,
      tool_description: toolkit?.tool_description,
      tool_type_text: toolkit?.tool_type_text,
      image_file_path: toolkit?.file_path,
      tool_kit_explain_page_file_path: toolkit?.tool_kit_explain_page_file_path,
      tool_kit_profile_page_file_path: toolkit?.tool_kit_profile_page_file_path,
      toolkit_id: toolkit?.id,
      toolkit_title: toolkit?.title ?? mappedSchedule.user_toolkit_title,
      toolkit_hlp_points: points,
      entries: [],
      schedule_Reminders: reminders,
      ...mappedSchedule,
      is_completed: schedule.completed,
    };
    if (answers && answers.length && toolkit) {
      const entries = this.prepareToolkitAnswers(
        toolkit.tool_kit_type,
        answers,
        toolkit.unit.unit,
      );
      newSchedule.entries = entries;
    }

    if (challenge) {
      newSchedule.challenge_emoji = challenge.emoji;
    }
    return newSchedule;
  }

  mapUserSchedules(schedules: ScheduleWithAnswers[]): UserSchedule[] {
    return schedules.map(this.mapUserSchedule.bind(this));
  }

  private async getUserSchedulesAndHabits(
    userId: string,
    args: GetDashboardArgs,
  ): Promise<{
    agenda: UserSchedule[];
    hasMore: boolean;
  }> {
    const [userSchedulesData, userHabitsData] = await Promise.all([
      this.getUserSchedules(userId, args),
      this.getUserHabits(userId, args),
    ]);
    const agenda = [...userHabitsData.habits, ...userSchedulesData.agenda];
    const hasMore = userHabitsData.has_more || userSchedulesData.hasMore;
    return {
      agenda,
      hasMore,
    };
  }

  async getAgendaByScheduleId(
    date: string,
    scheduleId: string,
  ): Promise<UserSchedule | null> {
    const [scheduleWithAnswer, habitScheduleWithAnswer] = await Promise.all([
      this.schedulesRepo.getScheduleWithAnswer(date, scheduleId),
      this.schedulesRepo.getHabitScheduleWithAnswer(date, scheduleId),
    ]);

    if (!scheduleWithAnswer && !habitScheduleWithAnswer) {
      return null;
    }

    const [userSchedules] = scheduleWithAnswer
      ? this.mapUserSchedules([scheduleWithAnswer])
      : [];

    const [userHabits] = habitScheduleWithAnswer
      ? this.mapUserHabits([habitScheduleWithAnswer])
      : [];

    // Combine userSchedules and userHabits, and return the first non-null value
    const agenda = userSchedules || userHabits;
    return agenda;
  }

  async getUserSchedules(
    userId: string,
    args: GetDashboardArgs,
  ): Promise<{
    hasMore: boolean;
    agenda: UserSchedule[];
  }> {
    const { page, limit = 5, filters } = args;
    const { weekdayShort: weekday, day } = DateTime.fromISO(args.date);
    const { scheduleWithAnswers, total } =
      await this.schedulesRepo.getSchedulesWithAnswers(
        userId,
        args.date,
        weekday as string,
        day,
        page,
        limit,
        filters,
      );
    const hasMore = page * limit < total;
    const userSchedules = this.mapUserSchedules(scheduleWithAnswers);
    return {
      hasMore,
      agenda: userSchedules,
    };
  }

  async getDashboard(
    userId: string,
    args: GetDashboardArgs,
  ): Promise<GetDashBoardResponse> {
    const user = await this.schedulesRepo.getUser(userId);
    const ageGroup = user.age_group as AgeGroups;
    if (!ageGroup) {
      throw new BadRequestException(`schedules.invalid_user_age_group`);
    }
    this.logger.log(`${userId}${args}`);
    const { date } = args;
    const [
      { hasMore, agenda },
      blog_posts,
      todayQuote,
      { challenges, serviceOffers },
      unreadChatCount,
    ] = await Promise.all([
      this.getUserSchedulesAndHabits(userId, args),
      this.schedulesRepo.getBlogs(userId, ageGroup),
      this.schedulesRepo.getQuotes(date),
      this.schedulesRepo.getServiceOffersAndChallenges(date),
      this.schedulesRepo.getUnreadChatCount(userId),
    ]);

    const userDailyBoostBlogOrder = this.getUserDailyBoostBlogOrder(
      user.created_at as string,
      date,
    );
    const finalBlogposts = this.prepareBlogpost(
      blog_posts,
      userDailyBoostBlogOrder,
    );
    const userHlpPoints = user.hlp_reward_points_balance
      ? user.hlp_reward_points_balance
      : 0;
    const dashboardChallenges = this.mapChallenges(challenges);
    const showRobot = await this.robotsService.getShowRobotStatus(
      userId,
      date,
      RobotPageType.DASHBOARD,
    );
    return {
      has_more: hasMore,
      agenda,
      blogs: finalBlogposts,
      quotes: todayQuote,
      offers: serviceOffers,
      challenges: dashboardChallenges,
      user_hlp_points: userHlpPoints,
      show_robot: showRobot,
      unread_chat_count: unreadChatCount,
    };
  }

  async getUserAgenda(
    userId: string,
    args: GetUserAgendaArgs,
  ): Promise<GetUserAgendaResponse> {
    const { hasMore, agenda } = await this.getUserSchedulesAndHabits(
      userId,
      args,
    );
    return {
      has_more: hasMore,
      agenda,
    };
  }

  async getPatientAgenda(
    patientAgendaArgs: GetPatientAgendaArgs,
  ): Promise<GetUserAgendaResponse> {
    const { user_id, ...args } = patientAgendaArgs;
    const { hasMore, agenda } = await this.getUserSchedulesAndHabits(
      user_id,
      args,
    );
    return {
      has_more: hasMore,
      agenda,
    };
  }

  private mapUserHabit(habit: HabitScheduleWithAnswers): UserHabit {
    const { toolkit, habit_day, habit_tool, ...newHabit } = habit;
    const mappedSchedule = this.mapUserSchedule({
      ...newHabit,
      toolkit: habit_tool,
    });
    const userHabit: UserHabit = {
      ...mappedSchedule,
      day_id: habit_day.id,
      habit_id: toolkit?.id,
      day: habit_day.day,
      habit_name: toolkit?.title,
      habit_tool_id: newHabit.habit_tool_id,
    };
    return userHabit;
  }

  private mapUserHabits(habits: HabitScheduleWithAnswers[]): UserHabit[] {
    return habits.map(this.mapUserHabit.bind(this));
  }

  async getUserHabits(
    userId: string,
    args: GetUserAgendaArgs,
  ): Promise<GetUserHabitsResponse> {
    this.logger.log(userId, args);
    const { page, limit = 5 } = args;
    const { habitsScheduleWithAnswers, total } =
      await this.schedulesRepo.getHabitTools(
        userId,
        args.date,
        args.page,
        args.limit,
      );
    const userHabits = this.mapUserHabits(habitsScheduleWithAnswers);
    const hasMore = page * limit < total;
    return {
      habits: userHabits,
      has_more: hasMore,
    };
  }

  async disableHabitSchedule(
    habitToolId: string,
    scheduleId: string,
    userId: string,
  ): Promise<HabitToolDeletedFromAgenda> {
    const habitTool = await this.schedulesRepo.getHabitTool(habitToolId);
    if (!habitTool) {
      throw new NotFoundException(`schedules.habit_tool_not_found`);
    }
    const habitToolDeletedFromAgenda =
      await this.schedulesRepo.saveHabitToolDeletedFromAgenda(
        userId,
        habitTool.id,
        habitTool.day_id,
        scheduleId,
      );
    this.logger.log(`Habit disabled`);
    return habitToolDeletedFromAgenda;
  }

  async disableAppointmentSchedule(
    appointmentId: string,
    endDate: string,
    userId: string,
  ): Promise<ScheduleEntity> {
    const schedules = await this.schedulesRepo.disableAppointmentSchedule(
      appointmentId,
      endDate,
      userId,
    );
    this.logger.log(`Disabled appointment schedule `);

    const scheduleIds = schedules.map((schedule) => schedule.id);

    if (scheduleIds.length) {
      //after disabling the appointment schedule, we need to disable the timeline item
      await this.schedulesRepo.disableScheduleTreatmentTimeline(scheduleIds);
      this.logger.log(`Disabled Treatment Timeline `);
    }

    return schedules[0];
  }

  async disableSchedule(
    userId: string,
    loggedInUser: string,
    args: DisableScheduleArgs,
    role: UserRoles,
  ): Promise<ScheduleEntity> {
    const { scheduleId, date, habitToolId } = args;
    const schedule =
      await this.schedulesRepo.getUserScheduleById<ScheduleEntity>(
        scheduleId,
        userId,
      );

    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }
    const { schedule_for, user_appointment_id } = schedule;

    if (habitToolId) {
      await this.disableHabitSchedule(habitToolId, scheduleId, userId);
      return schedule;
    }

    //only doctor can delete the appointment schedule
    const isAppointmentDeletable =
      role === UserRoles.DOCTOR &&
      schedule_for === ScheduleFor.APPOINTMENT &&
      user_appointment_id;

    if (isAppointmentDeletable) {
      return await this.disableAppointmentSchedule(
        user_appointment_id,
        date,
        loggedInUser,
      );
    }

    const disabledSchedule = await this.schedulesRepo.disableSchedule(
      scheduleId,
      date,
      loggedInUser,
    );
    this.logger.log(`Schedule disabled`);
    return disabledSchedule;
  }

  async validateCreateChallangeInputs(
    challengeId: string,
    userId: string,
  ): Promise<void> {
    const challenge = await this.schedulesRepo.getActiveChallengeById(
      challengeId,
    );

    if (!challenge) {
      throw new NotFoundException(`schedules.challenge_not_found`);
    }
    const challengeSchedule =
      await this.schedulesRepo.getActiveChallengeSchedule(userId, challenge.id);

    if (challengeSchedule) {
      throw new BadRequestException(
        `schedules.challenge_schedule_already_added`,
      );
    }
  }

  async validateToolkitAndOptionInputs(
    toolkitOptionsInput: ScheduleToolkitOptions,
    toolkitId: string,
  ): Promise<Toolkit> {
    const { medication_info_input, selected_option, selected_weight } =
      toolkitOptionsInput;

    const toolkit = await this.schedulesRepo.getToolKitById(toolkitId);

    if (!toolkit) {
      throw new NotFoundException(`schedules.toolkit_not_found`);
    }

    const { tool_kit_type: toolkitType } = toolkit;
    const isOptionRequired = toolkitsWithSelectOption.includes(toolkitType);
    const isOptionProvided = !!selected_option;
    const isMedicationInfoProvided = !!medication_info_input;
    const isWeightSelected = !!selected_weight;

    if (isOptionRequired && !isOptionProvided) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'schedules.selected_option_required_for',
        )} ${toolkitType} ${this.translationService.translate(
          'schedules.tool',
        )}`,
      );
    }

    if (!isOptionRequired && isOptionProvided) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'schedules.selected_option_not_required_for',
        )} ${toolkitType} ${this.translationService.translate(
          'schedules.tool',
        )}`,
      );
    }

    // check if selected option toolkit is valid
    if (selected_option) {
      const toolkitOption = await this.schedulesRepo.getToolkitOptions(
        selected_option,
        toolkitType,
      );
      if (!toolkitOption) {
        throw new NotFoundException(`schedules.toolkit_option_not_found`);
      }
    }

    if (toolkitType === ToolkitType.MEDICATION && !isMedicationInfoProvided) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'schedules.medication_info_required_for',
        )} ${toolkitType} ${this.translationService.translate(
          'schedules.tool',
        )}`,
      );
    }
    if (toolkitType !== ToolkitType.MEDICATION && isMedicationInfoProvided) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'schedules.invalid_medication_info_input_for',
        )} ${toolkitType} ${this.translationService.translate(
          'schedules.tool',
        )}`,
      );
    }

    if (toolkitType === ToolkitType.WEIGHT && !isWeightSelected) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'schedules.selected_weight_required_for',
        )} ${toolkitType} ${this.translationService.translate(
          'schedules.tool',
        )}`,
      );
    }
    if (toolkitType !== ToolkitType.WEIGHT && isWeightSelected) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'schedules.invalid_selected_weight_for',
        )} ${toolkitType} ${this.translationService.translate(
          'schedules.tool',
        )}`,
      );
    }
    return toolkit;
  }

  validateSchedleToolkitPlan(toolkitPlanInput: ScheduleToolkitPlan): void {
    const { repeat_per_day, repeat_per_month, schedule_days, schedule_type } =
      toolkitPlanInput;

    if (schedule_type === ScheduleType.ONE_TIME) {
      if (repeat_per_day > 1) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.invalid_repeat_per_day',
          )} '${repeat_per_day}' ${this.translationService.translate(
            'schedules.for_schedule_type',
          )} '${schedule_type}'`,
        );
      }

      if (schedule_days?.length || repeat_per_month?.length) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.schedule_days_and_repeat_per_month_not_allowed_for_schedule_type',
          )} '${schedule_type}'`,
        );
      }
    }

    if (schedule_type === ScheduleType.DAILY) {
      if (schedule_days?.length || repeat_per_month?.length) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.invalid_schedule_days_or_repeat_per_month_for_schedule_type',
          )} '${schedule_type}'`,
        );
      }
    }

    if (schedule_type === ScheduleType.WEEKLY) {
      if (!schedule_days?.length || repeat_per_month?.length) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.repeat_per_month',
          )} '${repeat_per_month}'${this.translationService.translate(
            'schedules.not_allowed_for_schedule_type',
          )}'${schedule_type}'`,
        );
      }

      const uniqueScheduleDays = [...new Set(schedule_days)];

      // Check if scheduleDay in the scheduleDays array is a valid day of the week
      for (const scheduleDay of uniqueScheduleDays) {
        if (!validScheduleDays.includes(scheduleDay)) {
          throw new BadRequestException(
            `${this.translationService.translate(
              'schedules.invalid_schedule_day',
            )} '${scheduleDay}'${this.translationService.translate(
              'schedules.for_schedule_type',
            )} ${schedule_type}`,
          );
        }
      }
    }

    if (schedule_type === ScheduleType.MONTHLY) {
      if (repeat_per_day > 1) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.invalid_repeat_per_day',
          )} '${repeat_per_day}' ${this.translationService.translate(
            'schedules.for_schedule_type',
          )} '${schedule_type}'`,
        );
      }

      if (schedule_days?.length || !repeat_per_month?.length) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.schedule_days',
          )} '${schedule_days}' ${this.translationService.translate(
            'schedules.not_allowed_for_schedule_type',
          )} '${schedule_type}'`,
        );
      }
      const uniqueRepeatPerMonths = [...new Set(repeat_per_month)];

      const daysInMonth = this.utilsService.getDaysInMonth(new Date());

      const isValid = uniqueRepeatPerMonths.every(
        (day) => day >= 1 && day <= daysInMonth.length,
      );

      if (!isValid) {
        throw new BadRequestException(
          `${this.translationService.translate(
            'schedules.invalid_repeat_per_month',
          )} ${this.translationService.translate(
            'schedules.for_schedule_type',
          )} '${schedule_type}'`,
        );
      }
    }

    if (schedule_type === ScheduleType.HABIT) {
      //TODO: add validation conditions for habit type
      return;
    }
  }

  async validateCreateScheduleInputs(
    createScheduleInput: CreateScheduleInput,
    userId: string,
  ): Promise<void> {
    const user = await this.schedulesRepo.getUser(userId);
    if (!user) {
      throw new NotFoundException(`schedules.user_not_found`);
    }
    const {
      schedule_input,
      medication_info_input,
      selected_option,
      selected_weight,
    } = createScheduleInput;

    const {
      tool_kit: toolkitId,
      user_toolkit_title,
      schedule_type,
      repeat_per_month,
      repeat_per_day,
      schedule_days,
      challenge_id: challengeId,
      schedule_for: scheduleFor,
      user_appointment,
      user_toolkit_note,
    } = schedule_input;

    if (user.role === UserRoles.DOCTOR) {
      if (
        scheduleFor !== ScheduleFor.USER_TOOLKIT &&
        scheduleFor !== ScheduleFor.APPOINTMENT
      ) {
        throw new BadRequestException(
          `schedules.coach_cannot_create_different_schedules`,
        );
      }
    }

    if (toolkitId && scheduleFor !== ScheduleFor.TOOL_KIT) {
      throw new NotFoundException(`schedules.toolkit_not_required`);
    }

    if (user_toolkit_title && scheduleFor !== ScheduleFor.USER_TOOLKIT) {
      throw new NotFoundException(`schedules.user_toolkit_title_not_required`);
    }

    if (user_toolkit_note && scheduleFor !== ScheduleFor.USER_TOOLKIT) {
      throw new NotFoundException(`schedules.user_toolkit_note_not_required`);
    }

    if (user_appointment && scheduleFor !== ScheduleFor.APPOINTMENT) {
      throw new NotFoundException(`schedules.user_appointment_not_required`);
    }

    if (repeat_per_day && scheduleFor === ScheduleFor.APPOINTMENT) {
      throw new NotFoundException(`schedules.repeat_per_day_not_required`);
    }

    if (challengeId && scheduleFor !== ScheduleFor.TOOL_KIT) {
      throw new NotFoundException(
        `schedules.challanges_not_available_for_custom_tools`,
      );
    }

    if (!toolkitId && selected_option) {
      throw new NotFoundException(
        `schedules.options_not_required_for_appointment`,
      );
    }

    if (scheduleFor === ScheduleFor.TOOL_KIT && toolkitId) {
      await this.validateToolkitAndOptionInputs(
        { medication_info_input, selected_option, selected_weight },
        toolkitId,
      );
    }

    if (scheduleFor === ScheduleFor.TOOL_KIT && challengeId) {
      await this.validateCreateChallangeInputs(challengeId, userId);
    }

    this.validateSchedleToolkitPlan({
      schedule_type,
      repeat_per_day,
      repeat_per_month,
      schedule_days,
    });
  }

  /**@description used to add reminders, while creating schedule */
  async saveScheduleReminders(
    scheduleId: string,
    reminders: string[],
  ): Promise<ScheduleReminder[] | undefined> {
    const schedule = await this.schedulesRepo.getActiveScheduleById<Schedule>(
      scheduleId,
    );
    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }
    const newReminders = reminders.map((reminder) => {
      const newReminder: ScheduleReminderDto = {
        reminder_time: reminder,
        schedule_id: scheduleId,
        user_id: schedule.user,
      };
      return newReminder;
    });

    if (!reminders.length) {
      return;
    }
    const addedReminders = await this.schedulesRepo.addScheduleReminders(
      newReminders,
    );
    await this.reminderService.addScheduleReminders(schedule, addedReminders);
    return addedReminders;
  }

  async saveSelectedToolkitOption(
    scheduleId: string,
    toolkitId: string,
    userId: string,
    selected_option?: string,
    selected_weight?: number,
    medication_info_input?: MedicationInfoInput,
  ): Promise<ToolkitOptions> {
    let saveToolkitOptionInput: SaveToolkitOptionsInput = {
      schedule_id: scheduleId,
      tool_kit_id: toolkitId,
      user_id: userId,
    };

    const toolkit = await this.schedulesRepo.getToolKitById(toolkitId);

    if (!toolkit) {
      throw new NotFoundException(`schedules.toolkit_not_found`);
    }

    const optionTableInfo =
      toolkitOptionTableInfo[
        toolkit.tool_kit_type as keyof typeof toolkitOptionTableInfo
      ];
    if (!optionTableInfo) {
      throw new NotFoundException(`schedules.options_table_info_not_found`);
    }
    const { optionFieldName, tableName } = optionTableInfo;
    if (
      selected_option &&
      toolkitsWithSelectOption.includes(toolkit.tool_kit_type)
    ) {
      saveToolkitOptionInput[optionFieldName] = selected_option;
    }

    if (selected_weight && toolkit.tool_kit_type === ToolkitType.WEIGHT) {
      saveToolkitOptionInput[optionFieldName] = selected_weight;
    }

    if (
      medication_info_input &&
      toolkit.tool_kit_type === ToolkitType.MEDICATION
    ) {
      saveToolkitOptionInput = {
        ...saveToolkitOptionInput,
        ...medication_info_input,
      };
    }

    const toolkitOption = await this.schedulesRepo.saveSelectedToolkitOption(
      saveToolkitOptionInput,
      tableName,
    );

    this.logger.log(`Toolkit Options Created, id:${toolkitOption.id}`);
    return toolkitOption;
  }

  /**
   * Creates a schedule for a user.
   *
   * @param userId - The ID of the user for whom the schedule is created.
   * @param createScheduleInput - The input data for creating the schedule.
   * @param loggedInUserId - The ID of the logged-in user who is creating the schedule.
   * @param loggedInUserRole - The role of the logged-in user it can be user or doctor.
   * @returns A Promise that resolves to a CreateScheduleResponse object containing a success message.
   */
  async createSchedule(
    userId: string,
    createScheduleInput: CreateScheduleInput,
    loggedInUserId: string,
    loggedInUserRole: UserRoles,
  ): Promise<CreateScheduleResponse> {
    const {
      schedule_input,
      reminders,
      selected_option,
      selected_weight,
      medication_info_input,
    } = createScheduleInput;

    /** Validate all the Input data */
    await this.validateCreateScheduleInputs(createScheduleInput, userId);

    const { user_appointment, ...scheduleInput } = schedule_input;

    /**
     * Appointment can be created by the doctor only. If the schedule is created for the appointment.
     * Then we need to get the user_id from the user_appointment object.
     * If the schedule is created for anything other than appointment, then we will use the userId.
     */
    let treatmentUserId = userId;

    if (ScheduleFor.APPOINTMENT && user_appointment) {
      treatmentUserId = user_appointment.user_id;
    }

    const saveScheduleInputs: SaveScheduleInput[] = [];

    const baseSaveScheduleInput: SaveScheduleInput = {
      ...scheduleInput,
      user: userId,
      created_by: loggedInUserId,
      is_schedule_disabled: scheduleInput.is_repeat_disabled || false,
    };

    const treatment = await this.schedulesRepo.getActiveTreatment(
      treatmentUserId,
    );

    if (treatment?.id) {
      baseSaveScheduleInput.treatment_id = treatment.id;
    }

    if (!baseSaveScheduleInput.schedule_days?.length) {
      baseSaveScheduleInput.schedule_days = undefined;
    }
    if (!baseSaveScheduleInput.repeat_per_month?.length) {
      baseSaveScheduleInput.repeat_per_month = undefined;
    }
    if (!baseSaveScheduleInput.tool_kit) {
      baseSaveScheduleInput.tool_kit = undefined;
    }

    const { schedule_for, user_toolkit_title } = baseSaveScheduleInput;

    /** Save Acitivity schedule (USER_TOOLKIT) */
    if (schedule_for === ScheduleFor.USER_TOOLKIT && user_toolkit_title) {
      const saveUserToolkit: SaveUserToolkitInput = {
        user_id: userId,
        title: user_toolkit_title,
        note: schedule_input.user_toolkit_note,
      };

      const userToolkit = await this.schedulesRepo.saveUserToolkit(
        saveUserToolkit,
      );
      this.logger.log(`User toolkit Created, id:${userToolkit.id}`);
      baseSaveScheduleInput.user_toolkit_id = userToolkit.id;
    }

    /** Save Appointment schedule */
    if (schedule_for === ScheduleFor.APPOINTMENT && user_appointment) {
      if (loggedInUserRole !== UserRoles.DOCTOR) {
        throw new BadRequestException(
          `schedules.user_can_not_create_appointment`,
        );
      }

      const complaintFormId = this.configService.getOrThrow<string>(
        EnvVariable.COMPLAINT_FORM_ID,
      );
      const sessionFormId = this.configService.getOrThrow<string>(
        EnvVariable.SESSION_FORM_ID,
      );

      const saveUserAppointment: SaveUserAppointmentInput = {
        id: ulid(),
        ...user_appointment,
      };

      const userAppointment = await this.schedulesRepo.saveUserAppointment(
        saveUserAppointment,
      );

      const {
        id,
        appointment_type,
        complaint_form_enabled,
        session_form_enabled,
      } = userAppointment;

      baseSaveScheduleInput.user_appointment_id = id;
      baseSaveScheduleInput.user_appointment_title = appointment_type;
      baseSaveScheduleInput.repeat_per_day = 1;

      baseSaveScheduleInput.complaint_form_id = complaint_form_enabled
        ? complaintFormId
        : undefined;
      baseSaveScheduleInput.session_form_id = session_form_enabled
        ? sessionFormId
        : undefined;

      // Create schedule for Doctor
      const saveDoctorScheduleInput: SaveScheduleInput = {
        ...baseSaveScheduleInput,
        user: userAppointment.doctor_id,
      };

      saveScheduleInputs.push(saveDoctorScheduleInput);

      // Create schedule for user
      const saveUserScheduleInput: SaveScheduleInput = {
        ...baseSaveScheduleInput,
        user: userAppointment.user_id,
      };

      saveScheduleInputs.push(saveUserScheduleInput);
    } else {
      saveScheduleInputs.push(baseSaveScheduleInput);
    }

    const schedules = await this.schedulesRepo.saveSchedules(
      saveScheduleInputs,
    );

    schedules.forEach(async (schedule) => {
      const {
        id: scheduleId,
        challenge_id: challengeId,
        tool_kit: toolkitId,
        user: scheduleUserId,
      } = schedule;

      const user = await this.schedulesRepo.getUser(scheduleUserId);
      if (!user) {
        throw new NotFoundException(`schedules.user_not_found`);
      }

      const requests = [];

      if (challengeId && user.role === UserRoles.USER) {
        const userchallengeRequest = this.schedulesRepo.saveUserChallenge(
          user.id,
          challengeId,
        );

        requests.push(userchallengeRequest);
      }

      const isOptionsProvided =
        selected_option || selected_weight || medication_info_input;

      if (toolkitId && isOptionsProvided && user.role === UserRoles.USER) {
        const saveToolkitOptionsRequest = this.saveSelectedToolkitOption(
          scheduleId,
          toolkitId,
          user.id,
          selected_option,
          selected_weight,
          medication_info_input,
        );
        requests.push(saveToolkitOptionsRequest);
      }

      if (reminders.length) {
        const saveScheduleReminderRequest = this.saveScheduleReminders(
          scheduleId,
          reminders,
        );
        requests.push(saveScheduleReminderRequest);
      }

      await Promise.all(requests);

      if (user.role === UserRoles.USER) {
        this.eventEmitter.emit(
          ScheduleEvent.SCHEDULE_ADDED,
          new ScheduleAddedEvent(schedule),
        );
      }
    });

    return {
      message: this.translationService.translate(`schedules.schedule_created`),
    };
  }

  async handleScheduleUpdate(
    body: HandleScheduleUpdateBody,
  ): Promise<HandleScheduleUpdateResponse> {
    const { data: schedule } = body;
    const isScheduleCompleted =
      schedule.is_completed || schedule.is_schedule_disabled;
    if (!isScheduleCompleted) {
      const reminders = await this.schedulesRepo.getRemindersByScheduelId(
        schedule.id,
      );
      await this.updateScheduleReminders(schedule.user, {
        scheduleId: schedule.id,
        reminders: reminders.map((reminder) => reminder.reminder_time),
      });
    }
    return {
      message: this.translationService.translate(`schedules.success`),
    };
  }

  async getSchedule(scheduleId: string): Promise<GetScheduleResponse> {
    const schedule = await this.schedulesRepo.getScheduleWithReminders(
      scheduleId,
    );
    this.logger.log(schedule);
    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }
    return { schedule };
  }

  getMappedCalenderSchedule(
    date: string,
    scheduleWithSessions: SchedulesWithSessions,
  ): UserCalenderSchedule {
    const { sessions, toolkit, total_sessions, reminders, ...schedule } =
      scheduleWithSessions;

    let completed_sessions = 0;
    let latestSession: UserScheduleSession | undefined;

    sessions.forEach((session) => {
      if (session.session_date === date) {
        completed_sessions += 1;

        if (!latestSession || session.created_at > latestSession?.created_at) {
          latestSession = session;
        }
      }
    });
    const repeat_per_day = schedule?.repeat_per_day || 1;
    const is_completed = completed_sessions >= repeat_per_day;

    const calenderSchedule: UserCalenderSchedule = {
      ...schedule,
      total_sessions,
      completed_sessions,
      tool_kit_category: toolkit?.tool_kit_category,
      tool_kit_type: toolkit?.tool_kit_type,
      tool_description: toolkit?.tool_description,
      tool_type_text: toolkit?.tool_type_text,
      toolkit_id: toolkit?.id,
      toolkit_title: toolkit?.title ?? schedule.user_toolkit_title,
      session_id: latestSession?.id,
      is_completed,
      schedule_Reminders: reminders,
    };

    return calenderSchedule;
  }

  mapCalenderAgenda(dateWithSchedules: DateWithSchedules[]): CalenderAgenda[] {
    return dateWithSchedules.map((data) => {
      const { date, schedules } = data;

      const agenda = schedules.map((schedule): UserCalenderSchedule => {
        return this.getMappedCalenderSchedule(date, schedule);
      });

      return {
        date,
        agenda,
      };
    });
  }

  filterCalenderSchedules(
    args: GetUserCalenderAgendaArgs,
    schedulesWithSessions: SchedulesWithSessions[],
  ): DateWithSchedules[] {
    const dateWithSchedules: DateWithSchedules[] = [];

    const dates = this.utilsService.getDateRange(args.startDate, args.endDate);

    dates.forEach((date) => {
      const { weekdayShort: weekday, day } = DateTime.fromISO(date);
      const schedules: SchedulesWithSessions[] = [];
      schedulesWithSessions.forEach((schedule) => {
        const scheduleStartDate = this.utilsService.getISODateString(
          new Date(schedule.start_date),
        );

        const isValidStartDate =
          !schedule.is_schedule_disabled && scheduleStartDate <= date;

        const isValidEndDate =
          schedule.is_schedule_disabled &&
          schedule.end_date &&
          this.utilsService.getISODateString(new Date(schedule.end_date)) >
            date;

        if (!isValidStartDate && !isValidEndDate) {
          return;
        }

        if (
          schedule.schedule_type === ScheduleType.ONE_TIME &&
          scheduleStartDate === date
        ) {
          schedules.push(schedule);
        } else if (schedule.schedule_type === ScheduleType.DAILY) {
          schedules.push(schedule);
        } else if (
          schedule.schedule_type === ScheduleType.WEEKLY &&
          schedule.schedule_days?.includes(weekday as string)
        ) {
          schedules.push(schedule);
        } else if (
          schedule.schedule_type === ScheduleType.MONTHLY &&
          schedule.repeat_per_month?.includes(day)
        ) {
          schedules.push(schedule);
        }
      });

      dateWithSchedules.push({ date, schedules });
    });

    return dateWithSchedules;
  }

  filterCalenderHabitSchedules(
    args: GetUserCalenderAgendaArgs,
    habitSchedulesWithSessions: HabitSchedulesWithSessions[],
  ): DateWithSchedules[] {
    const dateWithSchedules: DateWithSchedules[] = [];

    const dates = this.utilsService.getDateRange(args.startDate, args.endDate);

    dates.forEach((date) => {
      const scheduleWithSessions: SchedulesWithSessions[] = [];

      habitSchedulesWithSessions.forEach((habitSchedulesWithSession) => {
        const {
          habit_tools_deleted_from_agenda,
          habit_days_with_tools,
          toolkit,
          ...schedule
        } = habitSchedulesWithSession;

        const scheduleStartDate = this.utilsService.getISODateString(
          new Date(habitSchedulesWithSession.start_date),
        );

        const scheduleEndDate = this.utilsService.getISODateString(
          new Date(habitSchedulesWithSession.end_date as string), // end date never be null for HABIT tool
        );

        const habitDays = this.utilsService.getDateRange(
          scheduleStartDate,
          scheduleEndDate,
        );

        const day = habitDays.findIndex((habitDay) => habitDay === date) + 1;

        if (!day) {
          return;
        }

        const habitDayWithTools = habit_days_with_tools.find(
          (habitDay) => habitDay.day === day,
        );

        if (!habitDayWithTools) {
          return;
        }

        const dayInDeletedAgenda = habit_tools_deleted_from_agenda.some(
          (deletedAgenda) => deletedAgenda.day_id === habitDayWithTools.id,
        );

        if (dayInDeletedAgenda) {
          return;
        }

        const habitSchedules = habitDayWithTools.habit_tools.map(
          (habitTool) => {
            const habitSchedule: SchedulesWithSessions = {
              ...schedule,
              toolkit: habitTool.tool_kit,
              day_id: habitDayWithTools.id,
              day: habitDayWithTools.day,
              habit_name: toolkit?.title,
              habit_id: habitTool.id,
              habit_tool_id: habitTool.tool_kit.id,
            };
            return habitSchedule;
          },
        );

        scheduleWithSessions.push(...habitSchedules);
      });
      dateWithSchedules.push({ date, schedules: scheduleWithSessions });
    });

    return dateWithSchedules;
  }

  prepareUserCalenderAgenda(
    schedulesWithSessions: SchedulesWithSessions[],
    habitSchedulesWithSessions: HabitSchedulesWithSessions[],
    args: GetUserCalenderAgendaArgs,
  ): CalenderAgenda[] {
    const dateWithSchedules = [
      ...this.filterCalenderHabitSchedules(args, habitSchedulesWithSessions),
      ...this.filterCalenderSchedules(args, schedulesWithSessions),
    ];

    const matched: { [date: string]: DateWithSchedules } = {};

    //combine the schedules with same date in one object
    dateWithSchedules.forEach((dateWithSchedule) => {
      if (!matched[dateWithSchedule.date]) {
        matched[dateWithSchedule.date] = {
          date: dateWithSchedule.date,
          schedules: [],
        };
      }
      matched[dateWithSchedule.date].schedules.push(
        ...dateWithSchedule.schedules,
      );
    });
    const combionedSchedules = Object.values(matched);

    return this.mapCalenderAgenda(combionedSchedules);
  }

  async getUserCalenderAgenda(
    args: GetUserCalenderAgendaArgs,
    lang: string,
    filters?: AgendaFilter,
  ): Promise<GetUserCalenderAgendaResponse> {
    const [schedulesWithSessions, habitSchedulesWithSessions] =
      await Promise.all([
        this.schedulesRepo.getSchedulesWithSessions(args, lang, filters),
        this.schedulesRepo.getHabitSchedulesWithSessions(args),
      ]);

    const calenderAgenda = this.prepareUserCalenderAgenda(
      schedulesWithSessions,
      habitSchedulesWithSessions,
      args,
    );

    return { calenderAgenda };
  }

  async updateSelectedToolkitOption(
    scheduleId: string,
    toolkitId: string,
    userId: string,
    selected_option?: string,
    selected_weight?: number,
    medication_info_input?: UpdateMedicationInfoInput,
  ): Promise<ToolkitOptions> {
    const toolkit = await this.schedulesRepo.getToolKitById(toolkitId);

    if (!toolkit) {
      throw new NotFoundException(`schedules.toolkit_not_found`);
    }

    const optionTableInfo =
      toolkitOptionTableInfo[
        toolkit.tool_kit_type as keyof typeof toolkitOptionTableInfo
      ];
    if (!optionTableInfo) {
      throw new NotFoundException(`schedules.options_table_info_not_found`);
    }
    const { optionFieldName, tableName } = optionTableInfo;

    let updateToolkitOptionInput: UpdateToolkitOptionsInput = {};

    if (
      selected_option &&
      toolkitsWithSelectOption.includes(toolkit.tool_kit_type)
    ) {
      updateToolkitOptionInput[optionFieldName] = selected_option;
    }

    if (selected_weight && toolkit.tool_kit_type === ToolkitType.WEIGHT) {
      updateToolkitOptionInput[optionFieldName] = selected_weight;
    }

    if (
      medication_info_input &&
      toolkit.tool_kit_type === ToolkitType.MEDICATION
    ) {
      updateToolkitOptionInput = {
        ...updateToolkitOptionInput,
        ...medication_info_input,
      };
    }
    const toolkitOption = await this.schedulesRepo.updateSelectedToolkitOption(
      updateToolkitOptionInput,
      tableName,
      scheduleId,
      userId,
    );
    this.logger.log(`Toolkit Options Updated, id:${toolkitOption.id}`);
    return toolkitOption;
  }

  async validateUpdateScheduleInputs(
    userId: string,
    updateScheduleInput: UpdateScheduleInput,
  ): Promise<ScheduleEntity> {
    const { schedule_id, update_schedule } = updateScheduleInput;

    const [user, schedule] = await Promise.all([
      this.schedulesRepo.getUser(userId),
      this.schedulesRepo.getUserScheduleById<ScheduleEntity>(
        schedule_id,
        userId,
      ),
    ]);

    if (!user) {
      throw new NotFoundException(`schedules.user_not_found`);
    }

    if (!schedule) {
      throw new NotFoundException(`schedules.schedule_not_found`);
    }

    const { schedule_for, tool_kit: toolkitId } = schedule;

    const {
      schedule_input,
      medication_info_input,
      selected_option,
      selected_weight,
    } = update_schedule;

    const {
      user_toolkit_title,
      user_toolkit_note,
      schedule_type,
      repeat_per_month,
      repeat_per_day,
      schedule_days,
      end_date,
      is_repeat_disabled,
      user_appointment,
    } = schedule_input;

    if (schedule_type && repeat_per_day) {
      this.validateSchedleToolkitPlan({
        schedule_type,
        repeat_per_day,
        repeat_per_month,
        schedule_days,
      });
    }

    if (user_toolkit_title && schedule_for !== ScheduleFor.USER_TOOLKIT) {
      throw new BadRequestException(
        `schedules.user_toolkit_title_not_required`,
      );
    }

    if (user_toolkit_note && schedule_for !== ScheduleFor.USER_TOOLKIT) {
      throw new BadRequestException(`schedules.user_toolkit_note_not_required`);
    }

    if (user_appointment && schedule_for !== ScheduleFor.APPOINTMENT) {
      throw new BadRequestException(`schedules.user_appointment_not_required`);
    }

    if (toolkitId && schedule_for !== ScheduleFor.TOOL_KIT) {
      throw new BadRequestException(`schedules.toolkit_id_not_required`);
    }

    if (is_repeat_disabled && !end_date) {
      throw new BadRequestException(
        `schedules.end_date_required_for_stop_repeat`,
      );
    }

    if (
      schedule_type &&
      schedule_type !== ScheduleType.WEEKLY &&
      schedule_days
    ) {
      throw new BadRequestException(`schedules.schedule_days_not_required`);
    }

    if (
      schedule_type &&
      schedule_type !== ScheduleType.MONTHLY &&
      repeat_per_month
    ) {
      throw new BadRequestException(`schedules.repeat_per_month_not_required`);
    }

    if (!toolkitId && selected_option) {
      throw new BadRequestException(
        `schedules.options_not_required_for_appointment`,
      );
    }

    if (schedule_for === ScheduleFor.TOOL_KIT && toolkitId) {
      await this.validateToolkitAndOptionInputs(
        { medication_info_input, selected_option, selected_weight },
        toolkitId,
      );
    }

    return schedule;
  }

  async updateScheduleAndReminders(
    scheduleId: string,
    updateSchedule: UpdateSchedulesInput,
    reminders: string[],
  ): Promise<ScheduleEntity> {
    const updatedSchedule = await this.schedulesRepo.updateScheduleById(
      scheduleId,
      updateSchedule,
    );

    await this.updateScheduleReminders(updatedSchedule.user, {
      scheduleId: updatedSchedule.id,
      reminders: reminders,
    });
    return updatedSchedule;
  }

  async updateUserToolkitSchedule(
    userToolkitId: string,
    scheduleId: string,
    updateSchedule: UpdateSchedulesInput,
    reminders?: string[],
  ): Promise<UpdateScheduleResponse> {
    const { user_appointment_title, user_toolkit_note } = updateSchedule;

    const userToolkit =
      await this.schedulesRepo.getUserToolkitOrAppointmentsById<UserTookit>(
        userToolkitId,
        ScheduleFor.USER_TOOLKIT,
      );

    if (!userToolkit) {
      throw new NotFoundException(`toolkits.user_toolkit_not_found`);
    }

    await this.schedulesRepo.updateUserToolkitById(userToolkitId, {
      note: user_toolkit_note,
      title: user_appointment_title,
    });

    await this.updateScheduleAndReminders(
      scheduleId,
      updateSchedule,
      reminders || [],
    );

    return { message: 'user toolkit updated' };
  }

  async updateUserAppointmentSchedule(
    userAppointmentId: string,
    updatesUserAppointment: UpdateUserAppointmentInput,
    updateSchedule: UpdateSchedulesInput,
    reminders?: string[],
  ): Promise<UpdateScheduleResponse> {
    const userAppointment =
      await this.schedulesRepo.getUserToolkitOrAppointmentsById<UserAppointment>(
        userAppointmentId,
        ScheduleFor.APPOINTMENT,
      );

    if (!userAppointment) {
      throw new NotFoundException(`schedules.user_appointment_not_found`);
    }

    const updatedUserAppointment =
      await this.schedulesRepo.updateUserAppointmentById(
        userAppointmentId,
        updatesUserAppointment,
      );

    const { appointment_type, complaint_form_enabled, session_form_enabled } =
      updatedUserAppointment;

    const complaintFormId = this.configService.getOrThrow<string>(
      EnvVariable.COMPLAINT_FORM_ID,
    );

    const sessionFormId = this.configService.getOrThrow<string>(
      EnvVariable.SESSION_FORM_ID,
    );

    updateSchedule.user_appointment_title = appointment_type;
    updateSchedule.complaint_form_id = complaint_form_enabled
      ? complaintFormId
      : undefined;
    updateSchedule.session_form_id = session_form_enabled
      ? sessionFormId
      : undefined;

    //appointment is created for doctor and user so we update appointment schedule for both
    const updatedSchedules =
      await this.schedulesRepo.updateScheduleByUserAppointmentId(
        userAppointmentId,
        updateSchedule,
      );

    //update reminders for user and doctor
    const requests: [Promise<UpdateScheduleRemindersResponse>?] = [];

    updatedSchedules.forEach((updatedSchedule) => {
      const reminderRequest = this.updateScheduleReminders(
        updatedSchedule.user,
        {
          scheduleId: updatedSchedule.id,
          reminders: reminders || [],
        },
      );
      requests.push(reminderRequest);
    });

    await Promise.all(requests);

    return { message: 'user Appointment toolkit updated' };
  }

  async updateToolkitSchedule(
    scheduleId: string,
    updateSchedule: UpdateSchedulesInput,
    medication_info_input?: UpdateMedicationInfoInput,
    selected_option?: string,
    selected_weight?: number,
    reminders?: string[],
  ): Promise<UpdateScheduleResponse> {
    const updatedSchedule = await this.updateScheduleAndReminders(
      scheduleId,
      updateSchedule,
      reminders || [],
    );

    const isOptionsProvided =
      selected_option || selected_weight || medication_info_input;

    if (updatedSchedule.tool_kit && isOptionsProvided) {
      await this.updateSelectedToolkitOption(
        updatedSchedule.id,
        updatedSchedule.tool_kit,
        updatedSchedule.user,
        selected_option,
        selected_weight,
        medication_info_input,
      );
    }

    return {
      message: this.translationService.translate(`schedules.schedule_updated`),
    };
  }

  async updateSchedule(
    userId: string,
    loggedInUserId: string,
    loggedInUserRole: UserRoles,
    updateScheduleInput: UpdateScheduleInput,
  ): Promise<UpdateScheduleResponse> {
    const schedule = await this.validateUpdateScheduleInputs(
      userId,
      updateScheduleInput,
    );
    const { schedule_for } = schedule;

    const {
      schedule_input,
      reminders,
      medication_info_input,
      selected_option,
      selected_weight,
    } = updateScheduleInput.update_schedule;

    const { user_appointment: userAppointmentInput, ...scheduleInput } =
      schedule_input;

    const updateSchedule: UpdateSchedulesInput = {
      ...scheduleInput,
      updated_by: loggedInUserId,
      //if is_repeat_disabled is true then we disable the schedule till the end_date
      is_repeat_disabled: scheduleInput.is_repeat_disabled || false,
      is_schedule_disabled: scheduleInput.is_repeat_disabled || false,
    };

    if (
      updateSchedule.schedule_type === ScheduleType.ONE_TIME ||
      updateSchedule.schedule_type === ScheduleType.DAILY
    ) {
      updateSchedule.repeat_per_day = updateSchedule.repeat_per_day || 1;
    }

    if (updateSchedule.schedule_type !== ScheduleType.WEEKLY) {
      updateSchedule.schedule_days = [];
    }

    if (updateSchedule.schedule_type !== ScheduleType.MONTHLY) {
      updateSchedule.repeat_per_month = [];
    }

    /** Update User Acitivity (USER_TOOLKIT) */
    if (
      schedule_for === ScheduleFor.USER_TOOLKIT &&
      schedule.user_toolkit_id &&
      (scheduleInput.user_toolkit_title || scheduleInput.user_toolkit_note)
    ) {
      return await this.updateUserToolkitSchedule(
        schedule.user_toolkit_id,
        schedule.id,
        updateSchedule,
        reminders,
      );
    }

    /** Update User Appointment */
    if (
      schedule.schedule_for === ScheduleFor.APPOINTMENT &&
      schedule.user_appointment_id &&
      userAppointmentInput
    ) {
      if (loggedInUserRole !== UserRoles.DOCTOR) {
        throw new ForbiddenException(
          `schedules.user_can_not_update_appointment`,
        );
      }

      return await this.updateUserAppointmentSchedule(
        schedule.user_appointment_id,
        userAppointmentInput,
        updateSchedule,
        reminders,
      );
    }

    /** Update Toolkit Schedule */
    return await this.updateToolkitSchedule(
      schedule.id,
      updateSchedule,
      medication_info_input,
      selected_option,
      selected_weight,
      reminders,
    );
  }
}
