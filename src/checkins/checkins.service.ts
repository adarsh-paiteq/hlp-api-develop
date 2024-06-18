import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Checkin,
  CheckinDto,
  CheckinLevelWithStatus,
  GetUserCheckinsResponseDto,
  GetUserNextCheckinLevelResponse,
  DisableCheckinSchedulesBodyDto,
  ScheduleWithSessionsAndAnswer,
  toolKitAnswerFields,
} from './checkins.dto';
import { CheckinsRepo } from './checkins.repo';
import * as datefns from 'date-fns';
import { DateTime } from 'luxon';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckinEvent, UserCheckinLevelSavedEvent } from './checkins.events';
import {
  BloodPressureLogs,
  ScheduleCheckinDetails,
  GetCheckinLogsReponse,
  GetCheckinLogsReponseNew,
  HeartRateLogs,
  MedicationLogs,
  MoodCheckLogs,
  ScheduleAndCheckinWithAnswers,
  SleepCheckin,
  SleepLogs,
  StepsLogs,
  WeightLogs,
  HeartRateCheckin,
  BloodPressureCheckin,
  StepsCheckin,
  WeightCheckin,
  MedicationCheckin,
  MoodCheckCheckin,
} from './dto/checkin-logs.dto';
import { UtilsService } from '../utils/utils.service';
import {
  CheckinWithToolkitType,
  GetCheckinsHistoryResponse,
  GetCheckInsListWithUserCheckInStatusRes,
} from './dto/checkins-history.dto';
import { ToolkitService } from '../toolkits/toolkit.service';
import { CheckInInfo } from './entities/check-in-info.entity';
import {
  BloodPressureToolkitAnswers,
  HeartRateToolkitAnswers,
  MedicationToolkitAnswers,
  SleepCheckToolkitAnswers,
  StepsToolkitAnswers,
  Toolkit,
  ToolkitType,
  WeightIntakeToolkitAnswers,
  toolkitAnswerTables,
} from '../toolkits/toolkits.model';
import { ScheduleType } from '../schedules/entities/schedule.entity';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class CheckinsService {
  private readonly logger = new Logger(CheckinsService.name);
  constructor(
    private readonly checkinsRepo: CheckinsRepo,
    private readonly eventemitter: EventEmitter2,
    private readonly utilService: UtilsService,
    private readonly toolkitService: ToolkitService,
    private readonly translationService: TranslationService,
  ) {}

  private getMonthlySessions(
    scheduleSessions: ScheduleSessionDto[],
    days: number[],
    dateString: string,
  ): number {
    const date = new Date(dateString);
    const sessionDays = days.map((day) => {
      const dayOfMonth = datefns.setDate(date, day);
      const sessions = scheduleSessions.filter((session) =>
        datefns.isSameMonth(dayOfMonth, new Date(session.session_date)),
      );
      return {
        day,
        sessions,
      };
    });
    return sessionDays.filter((day) => day.sessions.length).length;
  }

  private getWeeklySessions(
    scheduleSessions: ScheduleSessionDto[],
    days: string[],
    dateString: string,
  ): number {
    const date = new Date(dateString);
    const startOfWeek = datefns.startOfWeek(date);
    const weekSessions = scheduleSessions.filter((session) =>
      datefns.isSameWeek(new Date(session.session_date), startOfWeek),
    );
    const sessionDays = days.map((day) => {
      const sessions = weekSessions.filter((session) => {
        const weekDay = datefns.format(new Date(session.session_date), 'EEE');
        return day === weekDay;
      });
      return {
        day,
        sessions,
      };
    });
    return sessionDays.filter((day) => day.sessions.length).length;
  }

  private getDailySessions(
    scheduleSessions: ScheduleSessionDto[],
    dateString: string,
  ): number {
    const date = new Date(dateString);
    const startOfWeek = datefns.startOfWeek(date);
    const weekSessions = scheduleSessions.filter((session) =>
      datefns.isSameWeek(new Date(session.session_date), startOfWeek),
    );
    return weekSessions.length;
  }

  private getOneTimeSessions(
    scheduleSessions: ScheduleSessionDto[],
    dateString: string,
  ): number {
    const date = new Date(dateString);
    const sessions = scheduleSessions.filter((session) =>
      datefns.isSameDay(date, new Date(session.session_date)),
    );
    return sessions.length;
  }

  private getScheduleDates(dateString: string): {
    sessionStartDate: string;
    sessionEndDate: string;
    scheduleStartDate: string;
    dayOfMonth: number;
    weekDay: string;
  } {
    const date = DateTime.fromISO(dateString).startOf('day');
    const dayOfMonth = date.day;
    const weekDay = date.toFormat('EEE');
    const startDate = date.startOf('month').startOf('day');
    const endDate = date.endOf('month').endOf('day');
    return {
      sessionStartDate: startDate.toISO() as string,
      sessionEndDate: endDate.toISO() as string,
      scheduleStartDate: date.toISO() as string,
      dayOfMonth,
      weekDay,
    };
  }

  async getUserNextCheckinLevel(
    userId: string,
  ): Promise<GetUserNextCheckinLevelResponse> {
    const [checkinLevels, points] = await Promise.all([
      this.checkinsRepo.getCheckinLevels(userId),
      this.checkinsRepo.getCheckinsTotalPoints(userId),
    ]);

    if (!checkinLevels.length) {
      const message = this.translationService.translate(
        `checkins.no_checkin_levels`,
      );
      return { message };
    }
    const completedCheckInLevelsTotalPoints = checkinLevels
      .filter((level) => level.is_completed)
      .reduce(
        (a, stage) => a + stage.hlp_reward_points_to_complete_check_in,
        0,
      );
    const nextLevel = checkinLevels.find((level) => !level.is_completed);
    if (!nextLevel) {
      const message = this.translationService.translate(
        `checkins.all_checkin_levels_completed`,
      );
      return { message };
    }
    const requiredPoints =
      nextLevel.hlp_reward_points_to_complete_check_in +
      completedCheckInLevelsTotalPoints;
    const isLevelCompleted = points >= requiredPoints;

    if (!isLevelCompleted) {
      const message = `${this.translationService.translate(
        'checkins.no_checkin_enough_ponts_complete',
      )} ${nextLevel.title}  ${this.translationService.translate(
        'checkins.required',
      )}${requiredPoints}${this.translationService.translate(
        'checkins.current',
      )}${points}`;
      return { message };
    }

    const userCheckinLevel = await this.checkinsRepo.saveUserCheckinLevel(
      userId,
      nextLevel.id,
    );
    this.eventemitter.emit(
      CheckinEvent.USER_CHECKIN_LEVEL_SAVED,
      new UserCheckinLevelSavedEvent(userCheckinLevel),
    );
    const message = `${nextLevel.title} ${this.translationService.translate(
      'checkins.reached',
    )}`;
    return { message, data: userCheckinLevel };
  }

  private getCheckinLevelWithProgress(
    checkinLevels: CheckinLevelWithStatus[],
    points: number,
  ): CheckinLevelWithStatus {
    const totalPoints = points;
    const mappedLevels = checkinLevels;
    const nextLevel = mappedLevels.find((level) => !level.is_completed);
    if (!nextLevel) {
      this.logger.log(`All checkin levels are completed`);
      // current level
      const currentLevel = mappedLevels[mappedLevels.length - 1];
      return { ...currentLevel, progress_percentage: 100 };
    }
    const { hlp_reward_points_to_complete_check_in: requiredPoints } =
      nextLevel;
    let progressPercentage = (totalPoints / requiredPoints) * 100;
    progressPercentage =
      progressPercentage > 100 ? 100 : Math.round(progressPercentage);
    this.logger.log(
      `total points ${totalPoints} for checkin ${nextLevel.title}`,
    );
    return { ...nextLevel, progress_percentage: progressPercentage };
  }

  private mapUserCheckin(
    checkin: Checkin,
    schedule?: ScheduleWithSessionsAndAnswer,
  ): CheckinDto {
    const mappedCheckin: CheckinDto = {
      id: checkin.id,
      tool_kit_id: checkin.tool_kit.id,
      tool_kit_category: checkin.tool_kit.tool_kit_category,
      tool_kit_type: checkin.tool_kit.tool_kit_type,
      title: checkin.title,
      description: checkin.description,
      avatar: checkin.avatar,
      schedule_type: schedule?.schedule_type,
      schedule_days: schedule?.schedule_days,
      latestAnswer: schedule?.['latestAnswer'],
      start_date: schedule?.start_date,
      schedule_id: schedule?.id,
      answer: schedule?.['answer'],
      goal_id: checkin.tool_kit.goal_id,
      emoji_image_id: checkin.emoji_image_id,
      emoji_image_url: checkin.emoji_image_url,
      emoji_image_file_path: checkin.emoji_image_file_path,
      total_sessions: schedule?.total_sessions,
      completed_sessions: schedule?.completed_sessions,
      schedule_sessions: schedule?.sessions,
      repeat_per_day: schedule?.repeat_per_day,
    };
    return mappedCheckin;
  }

  private prepareCheckins(
    schedules: ScheduleWithSessionsAndAnswer[],
    checkins: Checkin[],
  ): CheckinDto[] {
    let finalCheckins: CheckinDto[] = [];
    checkins.forEach((checkin) => {
      const checkinSchedules = schedules.filter(
        (schedule) => schedule.check_in === checkin.id,
      );

      if (checkinSchedules.length) {
        const mappedCheckinSchedules = checkinSchedules.map((schedule) =>
          this.mapUserCheckin(checkin, schedule),
        );
        finalCheckins = [...finalCheckins, ...mappedCheckinSchedules];
      }
    });

    return finalCheckins;
  }

  private mapSchedulesWithSessions(
    schedules: ScheduleWithSessionsAndAnswer[],
    dateString: string,
  ): ScheduleWithSessionsAndAnswer[] {
    return schedules.map((schedule) => {
      const {
        sessions,
        repeat_per_month,
        schedule_days,
        repeat_per_day = 1,
      } = schedule;
      let total_sessions = 1;
      let completed_sessions = 0;
      if (
        schedule.schedule_type === ScheduleType.MONTHLY &&
        repeat_per_month.length
      ) {
        total_sessions = repeat_per_month.length;
        completed_sessions = this.getMonthlySessions(
          sessions,
          repeat_per_month,
          dateString,
        );
      }
      if (
        schedule.schedule_type === ScheduleType.WEEKLY &&
        schedule_days &&
        schedule_days.length
      ) {
        total_sessions = schedule_days.length;
        completed_sessions = this.getWeeklySessions(
          sessions,
          schedule_days,
          dateString,
        );
      }
      if (schedule.schedule_type === ScheduleType.ONE_TIME) {
        total_sessions = schedule.repeat_per_day ? schedule.repeat_per_day : 1;
        completed_sessions = this.getOneTimeSessions(sessions, dateString);
      }
      if (schedule.schedule_type === ScheduleType.DAILY) {
        total_sessions = 7;
        completed_sessions = this.getDailySessions(sessions, dateString);
      }
      completed_sessions = Math.floor(completed_sessions / repeat_per_day);
      return { ...schedule, total_sessions, completed_sessions };
    });
  }

  private mapScheduleWithAnswers(
    schedules: ScheduleWithSessionsAndAnswer[],
  ): ScheduleWithSessionsAndAnswer[] {
    return schedules.map((schedule) => {
      const tableName = toolkitAnswerTables.get(schedule.tool_kit_type);
      if (!tableName) {
        return schedule;
      }
      const fieldName = toolKitAnswerFields.get(tableName);
      if (fieldName && schedule.latest_answer) {
        schedule['answer'] = `${schedule.latest_answer[fieldName] as unknown} ${
          schedule.toolkit_unit
        }`;
      }
      return schedule;
    });
  }

  async getUserCheckins(
    userId: string,
    dateString: string,
  ): Promise<GetUserCheckinsResponseDto> {
    const [checkinLevels, checkins, points] = await Promise.all([
      this.checkinsRepo.getCheckinLevels(userId),
      this.checkinsRepo.getUserCheckins(),
      this.checkinsRepo.getCheckinsTotalPoints(userId),
    ]);
    const checkinLevel = this.getCheckinLevelWithProgress(
      checkinLevels,
      points,
    );
    this.logger.log(dateString);
    const {
      dayOfMonth,
      weekDay,
      scheduleStartDate,
      sessionEndDate,
      sessionStartDate,
    } = this.getScheduleDates(dateString);

    const checkinIds = checkins.map((checkin) => checkin.id);
    const schedulesWithSessions =
      await this.checkinsRepo.getSchedulesByCheckinIds(
        checkinIds,
        userId,
        scheduleStartDate,
        sessionStartDate,
        sessionEndDate,
        dayOfMonth,
        weekDay,
      );
    const withSessionCount = this.mapSchedulesWithSessions(
      schedulesWithSessions,
      dateString,
    );
    const withAnswers = this.mapScheduleWithAnswers(withSessionCount);
    const final = this.prepareCheckins(withAnswers, checkins);
    const filteredCheckins = final.filter(
      (checkin) => checkin.total_sessions !== checkin.completed_sessions,
    );
    return {
      checkin_level: checkinLevel,
      checkins: filteredCheckins,
    };
  }

  async disableCheckinSchedules(
    body: DisableCheckinSchedulesBodyDto,
  ): Promise<string> {
    const { data } = body;
    if (!data.is_check_in_disabled_by_user) {
      this.logger.log(`checkin enabled`);
      return this.translationService.translate(`checkins.no_schedule_disabled`);
    }
    const schedules = await this.checkinsRepo.disableCheckinSchedules(
      data.check_in,
      data.user_id,
    );
    const scheduleIds = schedules.map((schedule) => schedule.id);
    const message = `${this.translationService.translate(
      'checkins.disabled_schedules',
    )} ${scheduleIds.toString()}`;
    this.logger.log(message);
    return message;
  }

  getScheduleCheckinDetails(
    data: ScheduleAndCheckinWithAnswers,
  ): ScheduleCheckinDetails {
    const completed_sessions = data.toolkit_answers
      ? data.toolkit_answers.answers.length
      : 0;
    const {
      user,
      emoji_image_file_path,
      emoji_image_id,
      emoji_image_url,
      challenge_id,
      check_in,
      check_ins_avatar,
      check_ins_title,
      goal_id,
      repeat_per_day,
      tool_kit,
      tool_kit_category,
      tool_kit_type,
      id,
      toolkit_unit,
    } = data;
    const checkinDetails: ScheduleCheckinDetails = {
      challenge_id,
      check_in,
      check_ins_avatar,
      check_ins_title,
      emoji_image_file_path,
      emoji_image_id,
      emoji_image_url,
      completed_sessions,
      goal_id,
      tool_kit,
      tool_kit_category,
      tool_kit_type,
      total_sessons: repeat_per_day ? repeat_per_day : 1,
      user,
      id,
      toolkit_unit,
    };
    return checkinDetails;
  }

  getMedicationCheckinData(
    uniqueCheckInsdata: ScheduleAndCheckinWithAnswers[],
  ): MedicationCheckin | undefined {
    const medicationCheckinData = uniqueCheckInsdata.find(
      (checkIn) => checkIn.tool_kit_type === ToolkitType.MEDICATION,
    );
    if (!medicationCheckinData) {
      return;
    }
    const scheduleCheckin = this.getScheduleCheckinDetails(
      medicationCheckinData,
    );
    if (!medicationCheckinData.toolkit_answers?.answers) {
      return {
        scheduleCheckin,
        logs: [],
      };
    }
    const {
      toolkit_answers: { answers },
    } = medicationCheckinData;
    const logs: MedicationLogs[] = answers.map((data) => {
      const answer = data as MedicationToolkitAnswers;
      return {
        medication: `${answer.doses}${medicationCheckinData.toolkit_unit}`,
        sessionTime: this.utilService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
        isCompleted: true,
      };
    });
    return { scheduleCheckin, logs };
  }

  getSleepCheckinData(
    uniqueCheckInsdata: ScheduleAndCheckinWithAnswers[],
  ): SleepCheckin | undefined {
    const sleepCheckinData = uniqueCheckInsdata.find(
      (checkIn) => checkIn.tool_kit_type === ToolkitType.SLEEP_CHECK,
    );
    if (!sleepCheckinData) {
      return;
    }
    const scheduleCheckin = this.getScheduleCheckinDetails(sleepCheckinData);
    if (!sleepCheckinData.toolkit_answers?.answers) {
      return {
        scheduleCheckin,
        logs: [],
      };
    }
    const {
      toolkit_answers: { answers },
    } = sleepCheckinData;
    const logs: SleepLogs[] = answers.map((data) => {
      const answer = data as SleepCheckToolkitAnswers;
      return {
        sleepTime: this.utilService.convertMinutesToHoursAndMinutes(
          answer.total_sleep_time,
        ),
        sessionTime: this.utilService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.quality_of_sleep,
        sessionId: answer.session_id,
      };
    });
    return { scheduleCheckin, logs };
  }

  getHeartRateCheckinData(
    uniqueCheckInsdata: ScheduleAndCheckinWithAnswers[],
  ): HeartRateCheckin | undefined {
    const heartRateCheckinData = uniqueCheckInsdata.find(
      (checkIn) => checkIn.tool_kit_type === ToolkitType.HEART_RATE,
    );
    if (!heartRateCheckinData) {
      return;
    }
    const scheduleCheckin =
      this.getScheduleCheckinDetails(heartRateCheckinData);
    if (!heartRateCheckinData.toolkit_answers?.answers) {
      return {
        scheduleCheckin,
        logs: [],
      };
    }
    const {
      toolkit_answers: { answers },
    } = heartRateCheckinData;
    const logs: HeartRateLogs[] = answers.map((data) => {
      const answer = data as HeartRateToolkitAnswers;
      return {
        heartRate: answer.average_heart_rate,
        sessionTime: this.utilService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return { scheduleCheckin, logs };
  }

  getBloodPressureCheckinData(
    uniqueCheckInsdata: ScheduleAndCheckinWithAnswers[],
  ): BloodPressureCheckin | undefined {
    const bloodPressureCheckinData = uniqueCheckInsdata.find(
      (checkIn) => checkIn.tool_kit_type === ToolkitType.BLOOD_PRESSURE,
    );
    if (!bloodPressureCheckinData) {
      return;
    }
    const scheduleCheckin = this.getScheduleCheckinDetails(
      bloodPressureCheckinData,
    );
    if (!bloodPressureCheckinData.toolkit_answers?.answers) {
      return {
        scheduleCheckin,
        logs: [],
      };
    }
    const {
      toolkit_answers: { answers },
    } = bloodPressureCheckinData;
    const logs: BloodPressureLogs[] = answers.map((data) => {
      const answer = data as BloodPressureToolkitAnswers;
      return {
        higestBp: answer.highest_bp,
        lowestBp: answer.lowest_bp,
        sessionTime: this.utilService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return { scheduleCheckin, logs };
  }

  getStepsCheckinData(
    uniqueCheckInsdata: ScheduleAndCheckinWithAnswers[],
  ): StepsCheckin | undefined {
    const stepsCheckinData = uniqueCheckInsdata.find(
      (checkIn) => checkIn.tool_kit_type === ToolkitType.STEPS,
    );
    if (!stepsCheckinData) {
      return;
    }
    const scheduleCheckin = this.getScheduleCheckinDetails(stepsCheckinData);
    if (!stepsCheckinData.toolkit_answers?.answers) {
      return {
        scheduleCheckin,
        logs: [],
      };
    }
    const {
      toolkit_answers: { answers },
    } = stepsCheckinData;
    const logs: StepsLogs[] = answers.map((data) => {
      const answer = data as StepsToolkitAnswers;
      return {
        steps: answer.steps,
        sessionTime: this.utilService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return { scheduleCheckin, logs };
  }

  getWeightCheckinData(
    uniqueCheckInsdata: ScheduleAndCheckinWithAnswers[],
  ): WeightCheckin | undefined {
    const weightCheckinData = uniqueCheckInsdata.find(
      (checkIn) => checkIn.tool_kit_type === ToolkitType.WEIGHT,
    );
    if (!weightCheckinData) {
      return;
    }
    const scheduleCheckin = this.getScheduleCheckinDetails(weightCheckinData);
    if (!weightCheckinData.toolkit_answers?.answers) {
      return {
        scheduleCheckin,
        logs: [],
      };
    }
    const {
      toolkit_answers: { answers },
    } = weightCheckinData;
    const logs: WeightLogs[] = answers.map((data) => {
      const answer = data as WeightIntakeToolkitAnswers;
      return {
        weight: answer.weight,
        sessionTime: this.utilService.getTimeInHourAndMinutes(
          answer.session_time,
        ),
        emoji: answer.feeling,
        sessionId: answer.session_id,
      };
    });
    return { scheduleCheckin, logs };
  }

  async getCheckinsLogsNew(
    userId: string,
    date: string,
  ): Promise<GetCheckinLogsReponseNew> {
    const [moodLogs, checkInsData] = await Promise.all([
      this.checkinsRepo.getMoodCheckLogs(userId, date),
      this.checkinsRepo.getCheckinWithScheduleAndAnswers(userId, date),
    ]);

    const uniqueCheckInsdata = [
      ...new Map(checkInsData.map((item) => [item['check_in'], item])).values(),
    ];

    const moodCheckLogs: MoodCheckLogs[] = moodLogs.map((moodCheck) => {
      return {
        sessionTime: this.utilService.getTimeInHourAndMinutes(moodCheck.time),
        emoji: moodCheck.emoji,
      };
    });
    const moodCheckCheckin: MoodCheckCheckin = {
      logs: moodCheckLogs,
    };

    const medicationCheckin = this.getMedicationCheckinData(uniqueCheckInsdata);
    const sleepCheckin = this.getSleepCheckinData(uniqueCheckInsdata);
    const heartRateCheckin = this.getHeartRateCheckinData(uniqueCheckInsdata);
    const bloodPressureCheckin =
      this.getBloodPressureCheckinData(uniqueCheckInsdata);
    const stepsCheckin = this.getStepsCheckinData(uniqueCheckInsdata);
    const weightCheckin = this.getWeightCheckinData(uniqueCheckInsdata);

    return {
      moodCheckCheckin,
      sleepCheckin,
      heartRateCheckin,
      bloodPressureCheckin,
      stepsCheckin,
      weightCheckin,
      medicationCheckin,
    };
  }

  async getCheckinLogs(
    userId: string,
    checkinId: string,
  ): Promise<GetCheckinLogsReponse> {
    const checkin = await this.checkinsRepo.getCheckin(checkinId);
    if (!checkin) {
      throw new NotFoundException(`checkins.checkin_not_found`);
    }
    const { tool_kit } = checkin;
    const logs = await this.toolkitService.getToolkitAnswersHistory(
      tool_kit.tool_kit_type,
      tool_kit.id,
      userId,
    );
    return {
      logs,
    };
  }

  async getCheckinsHistory(
    userId: string,
    lang: string,
  ): Promise<GetCheckinsHistoryResponse> {
    const checkins = await this.checkinsRepo.getCheckinsHistory(userId);
    const translatedCheckins =
      this.translationService.getTranslations<CheckinWithToolkitType>(
        checkins,
        ['title', 'description'],
        lang,
      );
    return {
      checkins: translatedCheckins,
    };
  }

  async getCheckInInfo(lang: string): Promise<CheckInInfo> {
    const checkinInfo = await this.checkinsRepo.getCheckInInfo();

    if (!checkinInfo) {
      throw new NotFoundException(`checkins.checkin_info_not_found`);
    }
    const [translatedCheckinInfo] =
      this.translationService.getTranslations<CheckInInfo>(
        [checkinInfo],
        ['title', 'description'],
        lang,
      );
    return translatedCheckinInfo;
  }

  async getCheckInsListWithUserCheckInStatus(
    userId: string,
    lang?: string,
  ): Promise<GetCheckInsListWithUserCheckInStatusRes[]> {
    const checkin =
      await this.checkinsRepo.getCheckInsListWithUserCheckInStatus(userId);
    if (!checkin.length) {
      throw new NotFoundException(`checkins.checkin_not_found`);
    }
    const translatedCheckin =
      this.translationService.getTranslations<GetCheckInsListWithUserCheckInStatusRes>(
        checkin,
        ['title', 'description'],
        lang,
      );
    const updatedTranslatedCheckin = translatedCheckin.map((checkinItem) => {
      const translatedToolkit =
        this.translationService.getTranslations<Toolkit>(
          [checkinItem.tool_kit],
          [
            'title',
            'description',
            'extra_information_title',
            'extra_information_description',
            'todo_screen_description',
            'tool_description',
            'tool_kit_info',
            'tool_type_text',
            'short_description',
          ],
          lang,
        );

      const toolkitTranslation = translatedToolkit[0] || {};
      return {
        ...checkinItem,
        tool_kit: {
          ...checkinItem.tool_kit,
          ...toolkitTranslation,
        },
      };
    });

    return updatedTranslatedCheckin;
  }
}
