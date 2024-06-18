import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ToolKitByToolKit } from './../schedules/schedules.dto';
import {
  graphToolkitTypes,
  ToolkitData,
  weekDays,
  PepareGraphData,
  toolKitOptionTables,
  GraphQueryResponse,
  toolkitGraphType,
  yearMonths,
  dayHours,
} from './toolkit.dto';
import { ToolkitRepo } from '../toolkits/toolkit.repo';
import * as datefns from 'date-fns';
import {
  AnswerHistory,
  answersHistoryEmojiFields,
  toolkitAnswerTables,
  answersHistoryTitleFormats,
  GetAnswersHistoryArgs,
  GetAnswersHistoryCalenderArgs,
  GetAnswersHistoryCalenderResponse,
  GetAnswersHistoryResponse,
  GetToolkitAnswerArgs,
  ToolkitHistoryPopupResponse,
  GetToolkitGraphArgs,
  GetToolkitGraphResponse,
  GraphAvgResponse,
  GraphData,
  GraphRange,
  GraphType,
  noTitleToolkits,
  SearchToolkitsArgs,
  SearchToolkitsResponse,
  toolkitAnswersValueFieldNames,
  ToolkitCategory,
  toolkitOptionsFieldNames,
  toolkitOptionsSelectedFieldNames,
  toolkitSelectedOptionTables,
  toolkitOptionsTableNames,
  toolkitTypesWithOptions,
  ToolkitAnswers,
  NormalToolkitGoal,
  HabitToolkitGoal,
  GoalType,
  Toolkit,
  ToolkitType,
  EpisodeType,
} from './toolkits.model';
import { Schedule } from '../schedules/schedules.model';

import { DateTime, Zone } from 'luxon';
import {
  AudioToolkitFilesAndSessionId,
  GetToolkitArgs,
  GetToolkitDetailsResponse,
  NormalHabitToolkitGoal,
  normalHabitToolkits,
  ToolkitGoalData,
  ToolkitGoalWithOptions,
  ToolkitGoalWithoutOptions,
  toolkitsWithOptions,
  toolkitsWithoutOptions,
} from './dto/get-toolkit-details.dto';
import { GoalsService } from '../goals/goals.service';
import { GoalLevelWithStatus } from '../goals/dto/goal-levels.dto';
import { Goal } from '../goals/entities/goal.entity';
import { UserGoalLevels } from '../goals/goals.model';
import { UtilsService } from '../utils/utils.service';
import { GetToolkitAnswerResponse } from './dto/get-toolkit-answer.dto';
import {
  EPISODE_TOOLS_ANSWER_TABLE,
  EpisodeFormWithStatus,
  EpisodeTool,
  EpisodeToolAnswer,
  EpisodeToolAnswerTable,
  EpisodeVideoWithStatus,
  GetEpisodeToolkitDetailsArgs,
  GetEpisodeToolkitDetailsResponse,
} from './dto/get-episode-toolkit-details.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  SavePlayedAudioToolkitAudioFileInput,
  SavePlayedAudioToolkitAudioFileResponse,
} from './dto/save-played-audio-toolkit-audio-file.dto';
import {
  AudioToolkitFileWithStatus,
  GetAudioToolkitDetailsArgs,
  GetAudioToolkitDetailsResponse,
} from './dto/get-audio-toolkit-details.dto';
import { PlayedAudioToolkitAudioFile } from './entities/played-audio-toolkit-audio-file.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { getISODate } from '../utils/util';
import {
  InsertUserToolkitAnswerInput,
  SaveUserToolkitAnswerInput,
  SaveUserToolkitAnswerResponse,
} from './dto/save-user-toolkit-answer.dto';
import {
  GetAppointmentDetailsArgs,
  GetAppointmentDetailsResponse,
} from './dto/get-appointment-details.dto';
import {
  InsertUserAppointmentAnswerInput,
  SaveUserAppointmentAnswerInput,
} from './dto/save-user-appointment-answer.dto';
import { ulid } from 'ulid';
import {
  GetAppointmentHistoryArgs,
  GetAppointmentHistoryResponse,
} from './dto/get-appointment-history.dto';
import {
  GetFormToolkitDetailsArgs,
  GetFormToolkitDetailResponse,
} from './dto/get-toolkit-form-details.dto';
import {
  SaveToolkitAnswerResponse,
  SaveToolkitAnswerInput,
  SaveToolkitAnswersInput,
  toolkitAnswerInputFields,
} from './dto/save-toolkit-answer.dto';
import { AddictionLogToolkitAnswer } from './entities/addiction-log-toolkit-answer.entity';
import {
  GetAllToolkitsHistoryArgs,
  GetAllToolkitsHistoryResponse,
} from './dto/get-toolkit-history.dto';
@Injectable()
export class ToolkitService {
  private readonly logger = new Logger(ToolkitService.name);
  private userTimeZone: Zone;
  constructor(
    private readonly toolkitRepo: ToolkitRepo,
    private readonly goalsService: GoalsService,
    private readonly utilService: UtilsService,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * This function is deprecated and should not be used.
   *  @function CheckIfUserHasJoinedChallenge() are used in CheckIfUserHasJoinedChallenge Action
   * which is not used from app side
   * In app side they are using getToolkitDetails resolver
   * @deprecated
   */
  public async getRemainingToolkitDataForCheckIfUserHasJoinedChallange(
    toolkitId: string,
    userId: string,
    scheduleId: string,
  ): Promise<ToolkitData> {
    const { tool_kit } = await this.toolkitRepo.getToolkit(toolkitId);
    const groupByToolkitType: Record<string, ToolKitByToolKit[]> =
      tool_kit.reduce((acc, toolkit: ToolKitByToolKit) => {
        acc[toolkit.tool_kit_type] = acc[toolkit.tool_kit_type] || [];
        acc[toolkit.tool_kit_type].push(toolkit);
        return acc;
      }, Object.create(null));
    let toolkitData: ToolkitData;
    const toolkitType = Object.keys(groupByToolkitType)[0];
    if (toolkitType === ToolkitType.RUNNING) {
      toolkitData = await this.toolkitRepo.getRunningToolkitData(toolkitId);
    } else if (toolkitType === ToolkitType.VIDEO) {
      toolkitData = await this.toolkitRepo.getVideoToolkitData(toolkitId);
    } else if (toolkitType === ToolkitType.MEDITATION) {
      toolkitData = await this.toolkitRepo.getMeditationToolkitData(toolkitId);
    } else if (toolkitType === ToolkitType.HEART_RATE) {
      toolkitData = await this.toolkitRepo.getHeartRateToolkitData(toolkitId);
    } else if (toolkitType === ToolkitType.ECG) {
      toolkitData = await this.toolkitRepo.getHeartEcgToolkitData(toolkitId);
    } else if (toolkitType === ToolkitType.PODCAST) {
      toolkitData = await this.toolkitRepo.getPodcastToolkitData(toolkitId);
    } else if (toolkitType === ToolkitType.BLOOD_PRESSURE) {
      toolkitData = await this.toolkitRepo.getBloodPressureToolkitData(
        toolkitId,
      );
    } else if (toolkitType === ToolkitType.ACTIVITY) {
      toolkitData = await this.toolkitRepo.getActivityToolkitTypeData(
        toolkitId,
      );
    } else if (toolkitType === ToolkitType.WEIGHT) {
      toolkitData = await this.toolkitRepo.getWeightToolkitTypeByIdData(
        toolkitId,
        userId,
        scheduleId,
      );
    } else if (toolkitType === ToolkitType.SPORT) {
      toolkitData = await this.toolkitRepo.geSportToolkitData(
        toolkitId,
        userId,
        scheduleId,
      );
    } else if (toolkitType === ToolkitType.STEPS) {
      toolkitData = await this.toolkitRepo.getStepsToolkitData(
        toolkitId,
        userId,
        scheduleId,
      );
    } else if (toolkitType === ToolkitType.SLEEP_CHECK) {
      toolkitData = await this.toolkitRepo.getSleepToolkitData(
        toolkitId,
        userId,
        scheduleId,
      );
    } else if (toolkitType === ToolkitType.ALCOHOL_INTAKE) {
      toolkitData = await this.toolkitRepo.getAlcoholToolkitData(
        toolkitId,
        userId,
        scheduleId,
      );
    } else if (toolkitType === ToolkitType.MEDICATION) {
      toolkitData = await this.toolkitRepo.getMedicationToolkitData(
        toolkitId,
        userId,
        scheduleId,
      );
    } else {
      throw new NotFoundException(`toolkits.not_found`);
    }
    return toolkitData;
  }

  isScheduledDisableByUser(date: string): boolean {
    const currentDate = getISODate(new Date());
    const endDate = getISODate(new Date(date));
    return endDate <= currentDate;
  }

  async getToolkitDetails(
    body: GetToolkitArgs,
    userId: string,
    lang?: string,
  ): Promise<GetToolkitDetailsResponse> {
    const { id, session_date } = body;
    const user = await this.toolkitRepo.getUserById(userId);

    if (!user) {
      throw new NotFoundException(`toolkits.user_not_found`);
    }
    const toolkit = await this.toolkitRepo.getToolkitNew(id);
    if (!toolkit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }
    // fix this later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,
    const requests: any[] = [
      this.toolkitRepo.getChallengeByToolkit(toolkit.id, userId),
    ];
    const toolkitOptionsTableName = toolKitOptionTables.get(
      toolkit.tool_kit_type,
    );
    const toolkitSelectedOptionsTableName = toolkitSelectedOptionTables.get(
      toolkit.tool_kit_type,
    );
    if (toolkitOptionsTableName) {
      const optionsRequest = this.toolkitRepo.getToolkitOptionsNew(
        id,
        toolkitOptionsTableName,
      );
      requests.push(optionsRequest);
    }
    if (!toolkitOptionsTableName) {
      requests.push([]);
    }
    if (body.schedule_id) {
      const scheduleRequest = this.toolkitRepo.getScheduleByIdNew(
        body.schedule_id,
      );

      requests.push(scheduleRequest);
      if (toolkitSelectedOptionsTableName) {
        const selectedOptionRequest =
          this.toolkitRepo.getToolkitOptionsSelectedNew(
            body.schedule_id,
            toolkitSelectedOptionsTableName,
          );
        requests.push(selectedOptionRequest);
      }
    }
    if (!body.schedule_id) {
      requests.push(null);
    }
    if (!toolkitSelectedOptionsTableName) {
      requests.push([]);
    }

    const [challenge, options, schedule, selectedOptions] = await Promise.all(
      requests,
    );

    if (body.schedule_id && !schedule) {
      throw new NotFoundException(`toolkits.schedule_not_found`);
    }

    if (schedule && schedule.is_schedule_disabled && schedule.end_date) {
      const isScheduleDisabled = this.isScheduledDisableByUser(
        schedule.end_date,
      );
      if (isScheduleDisabled) {
        throw new NotFoundException(`toolkits.agenda_not_found`);
      }
    }

    const batchRequests: [
      Promise<ToolkitGoalData | undefined>?,
      Promise<AudioToolkitFilesAndSessionId>?,
    ] = [];

    if (schedule) {
      const goalDataPromise = this.getToolkitGoalDetails(
        id,
        userId,
        schedule.id,
        session_date,
        lang,
      );
      batchRequests.push(goalDataPromise);

      if (toolkit.tool_kit_type === ToolkitType.AUDIO) {
        const audioOptionsPromise = this.getAudioToolkitOptionsAndSession(
          schedule.id,
          toolkit.id,
        );
        batchRequests.push(audioOptionsPromise);
      }
    }

    const [goalData, audioOptionsData] = await Promise.all(batchRequests);
    const toolkitDetails: GetToolkitDetailsResponse = {
      options,
      schedule,
      toolkit,
      selectedOptions,
      challenge,
      goalData,
    };

    if (audioOptionsData || ToolkitType.AUDIO) {
      //if there's no scheduleId we will send is_completed false
      toolkitDetails.options = audioOptionsData
        ? audioOptionsData.audioToolkitFiles
        : toolkitDetails.options?.map((option) => {
            return { ...option, is_completed: false };
          });
      toolkitDetails.sessionId = audioOptionsData
        ? audioOptionsData.sessionId
        : uuidv4();
    }

    return toolkitDetails;
  }

  private getGraphDateRange(
    date: string,
    range: GraphRange,
  ): { startDate: string; endDate: string } {
    const inputDateTime = DateTime.fromISO(date);
    let startDate = inputDateTime.toISODate() as string;
    let endDate = inputDateTime.toISODate() as string;

    if (range === GraphRange.WEEK) {
      startDate = inputDateTime.startOf('week').toISODate() as string;
      endDate = inputDateTime.endOf('week').toISODate() as string;
    }
    if (range === GraphRange.MONTH) {
      startDate = inputDateTime.startOf('month').toISODate() as string;
      endDate = inputDateTime.endOf('month').toISODate() as string;
    }
    if (range === GraphRange.YEAR) {
      startDate = inputDateTime.startOf('year').toISODate() as string;
      endDate = inputDateTime.endOf('year').toISODate() as string;
    }
    return { startDate, endDate };
  }

  private async getToolkitAverages(
    prepareGraphData: PepareGraphData,
  ): Promise<GraphAvgResponse[]> {
    const { toolkitType } = prepareGraphData;
    if (toolkitType === ToolkitType.BLOOD_PRESSURE) {
      return [];
    }
    if (toolkitType === ToolkitType.VITALS) {
      return [];
    }
    if (toolkitType === ToolkitType.WEIGHT) {
      return this.toolkitRepo.getWeightAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.ALCOHOL_INTAKE) {
      return this.toolkitRepo.getAlcoholAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.SLEEP_CHECK) {
      return this.toolkitRepo.getSleepcheckAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.SPORT) {
      return this.toolkitRepo.getSportskAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.HEART_RATE) {
      return this.toolkitRepo.getHeartRateAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.ECG) {
      return this.toolkitRepo.getEcgAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.STEPS) {
      return this.toolkitRepo.getStepsAvg(prepareGraphData);
    }
    if (toolkitType === ToolkitType.MEDITATION) {
      return this.toolkitRepo.getMeditationAvg(prepareGraphData);
    }
    throw new BadRequestException(
      `${this.translationService.translate(
        'toolkits.averages_not_supported_for_toolkit_type',
      )}, ${toolkitType}`,
    );
  }

  async getToolkitGraph(
    userId: string,
    args: GetToolkitGraphArgs,
  ): Promise<GetToolkitGraphResponse> {
    const { date, toolkitId, range: graphRange } = args;
    const toolkit = await this.toolkitRepo.getToolkitNew(toolkitId);
    if (!toolkit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }
    const toolkitType = toolkit.tool_kit_type as ToolkitType;
    this.logger.log(toolkitType);

    const invalidToolkit = !graphToolkitTypes.includes(toolkitType);
    if (invalidToolkit) {
      throw new BadRequestException(`toolkits.toolkit_type_not_supported`);
    }
    const { startDate, endDate } = this.getGraphDateRange(date, graphRange);

    const prepareGraphData: PepareGraphData = {
      userId: userId,
      startDate: startDate,
      endDate: endDate,
      toolkitType: toolkitType,
      graphRange: graphRange,
    };
    this.logger.log(prepareGraphData);

    if (graphRange === GraphRange.DAY) {
      const [toolkitData, toolkitAverages] = await Promise.all([
        this.toolkitRepo.getDayScatteredGraphData(prepareGraphData),
        this.getToolkitAverages(prepareGraphData),
      ]);
      return this.getGraphDataByDay(toolkitData, toolkitAverages);
    }

    const [toolkitData, toolkitAverages] = await Promise.all([
      this.toolkitRepo.getToolkitDataForGraph(prepareGraphData),
      this.getToolkitAverages(prepareGraphData),
    ]);

    if (graphRange === GraphRange.WEEK) {
      return this.getGraphDataByWeek(toolkitData, toolkitType, toolkitAverages);
    }
    if (graphRange === GraphRange.MONTH) {
      return this.getGraphDataByMonth(
        toolkitData,
        toolkitType,
        new Date(startDate),
        toolkitAverages,
      );
    }
    return this.getGraphDataByYear(toolkitData, toolkitType, toolkitAverages);
  }

  getLabelForDayGraph(isoDate: string): string {
    const dateTime = DateTime.fromJSDate(new Date(isoDate)).setZone(
      this.userTimeZone,
    );
    const hour = dateTime.get('hour');
    const minute = dateTime.get('minute');
    const decimalPart = Math.trunc((minute * 100) / 60);
    const time = `${hour}.${decimalPart}`;
    return time;
  }

  /**@description every Day filter data will be of Scattered Graph Type */
  private getGraphDataByDay(
    toolkitData: GraphQueryResponse[],
    toolkitAverages: GraphAvgResponse[],
  ): GetToolkitGraphResponse {
    const graphType = GraphType.SCATTERED;
    const graphData: GraphData[] = [];

    dayHours.forEach((day) => {
      const matches = toolkitData.filter(
        (data) => Number(day) === Math.trunc(Number(data.label)),
      );
      if (matches.length) {
        matches.forEach((match) => {
          graphData.push({
            x: match.label,
            y: match.total ? match.total : 0,
          });
        });
      } else {
        graphData.push({ x: day, y: 0 });
      }
    });
    const labels = dayHours
      .filter((hour) => Number(hour) % 6 === 0 || hour === '1')
      .map((hour) => String(hour));
    return {
      data: graphData,
      labels,
      graphType: graphType,
      graphRange: GraphRange.DAY,
      averages: toolkitAverages,
    };
  }

  private getGraphDataByWeek(
    toolkitData: GraphQueryResponse[],
    toolkitType: ToolkitType,
    toolkitAverages: GraphAvgResponse[],
  ): GetToolkitGraphResponse {
    const graphType = toolkitGraphType.get(toolkitType) as GraphType;
    const graphData: GraphData[] = [];
    if (graphType !== GraphType.RANGE) {
      weekDays.forEach((day, index) => {
        const match = toolkitData.find((data) => index === Number(data.label));
        const data = match ? Number(match.total) : 0;
        const translatedDay = this.translationService.translate(
          `constant.${day}`,
        );
        graphData.push({ label: translatedDay, data });
      });
      const translatedWeekDay = weekDays.map((day) =>
        this.translationService.translate(`constant.${day}`),
      );
      return {
        data: graphData,
        labels: translatedWeekDay,
        graphType: graphType,
        graphRange: GraphRange.WEEK,
        averages: toolkitAverages,
      };
    }
    weekDays.forEach((day, index) => {
      const match = toolkitData.find((data) => index === Number(data.label));
      const start = match ? Number(match.start) : 0;
      const end = match ? Number(match.end) : 0;
      const translatedDay = this.translationService.translate(
        `constant.${day}`,
      );
      graphData.push({ label: translatedDay, start, end });
    });
    const translatedWeekDay = weekDays.map((day) =>
      this.translationService.translate(`constant.${day}`),
    );
    return {
      data: graphData,
      labels: translatedWeekDay,
      graphType: graphType,
      graphRange: GraphRange.WEEK,
      averages: toolkitAverages,
    };
  }

  private getGraphDataByMonth(
    toolkitData: GraphQueryResponse[],
    toolkitType: ToolkitType,
    date: Date,
    toolkitAverages: GraphAvgResponse[],
  ): GetToolkitGraphResponse {
    const graphType = toolkitGraphType.get(toolkitType) as GraphType;
    const graphData: GraphData[] = [];
    const monthDays: string[] = [];
    const daysInMonth = datefns.getDaysInMonth(date);
    for (let day = 1; day <= daysInMonth; day++) {
      monthDays.push(day.toString());
    }
    const labels = monthDays
      .filter((day) => Number(day) % 7 === 0 || day === '1')
      .map((day) => String(day));
    if (graphType !== GraphType.RANGE) {
      monthDays.forEach((day, index) => {
        const match = toolkitData.find(
          (data) => index + 1 === Number(data.label),
        );
        const data = match ? Number(match.total) : 0;
        graphData.push({ label: day, data });
      });
      return {
        data: graphData,
        labels,
        graphType: graphType,
        graphRange: GraphRange.MONTH,
        averages: toolkitAverages,
      };
    }
    monthDays.forEach((day, index) => {
      const match = toolkitData.find(
        (data) => index + 1 === Number(data.label),
      );
      const start = match ? Number(match.start) : 0;
      const end = match ? Number(match.end) : 0;
      graphData.push({ label: day, start, end });
    });
    return {
      data: graphData,
      labels,
      graphType: graphType,
      graphRange: GraphRange.MONTH,
      averages: toolkitAverages,
    };
  }

  private getGraphDataByYear(
    toolkitData: GraphQueryResponse[],
    toolkitType: ToolkitType,
    toolkitAverages: GraphAvgResponse[],
  ): GetToolkitGraphResponse {
    const graphType = toolkitGraphType.get(toolkitType) as GraphType;
    const graphData: GraphData[] = [];
    if (graphType !== GraphType.RANGE) {
      yearMonths.forEach((month, index) => {
        const match = toolkitData.find(
          (data) => index + 1 === Number(data.label),
        );
        const data = match ? Number(match.total) : 0;
        const translatedMonth = this.translationService.translate(
          `constant.${month}`,
        );
        graphData.push({ label: translatedMonth, data });
      });
      const translatedMonth = yearMonths.map((month) =>
        this.translationService.translate(`constant.${month}`),
      );
      return {
        data: graphData,
        labels: translatedMonth,
        graphType: graphType,
        graphRange: GraphRange.YEAR,
        averages: toolkitAverages,
      };
    }
    yearMonths.forEach((month, index) => {
      const match = toolkitData.find(
        (data) => index + 1 === Number(data.label),
      );
      const start = match ? Number(match.start) : 0;
      const end = match ? Number(match.end) : 0;
      const translatedMonth = this.translationService.translate(
        `constant.${month}`,
      );
      graphData.push({ label: translatedMonth, start, end });
    });
    const translatedMonth = yearMonths.map((month) =>
      this.translationService.translate(`constant.${month}`),
    );
    return {
      data: graphData,
      labels: translatedMonth,
      graphType: graphType,
      graphRange: GraphRange.YEAR,
      averages: toolkitAverages,
    };
  }
  public async getRewardsData(
    userId: string,
    toolkitId: string,
  ): Promise<{
    earned: number;
    bonuses: number;
  }> {
    return await this.toolkitRepo.getRewardsData(userId, toolkitId);
  }

  async getToolkitAnswersHistory(
    toolkitType: ToolkitType,
    toolkitId: string,
    userId: string,
    page?: number,
    size?: number,
  ): Promise<AnswerHistory[]> {
    page = Number(page) || 0;
    const limit = Number(size) || 10;
    const offset = (page - 1 + 1) * limit;
    const tableName = toolkitAnswerTables.get(toolkitType);
    const titleFormat = answersHistoryTitleFormats.get(toolkitType);
    const emojiField = answersHistoryEmojiFields.get(toolkitType);
    if (toolkitType === ToolkitType.FORM) {
      const data = await this.toolkitRepo.getFormsToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
      );
      return data;
    }
    if (toolkitType === ToolkitType.AUDIO) {
      const data = await this.toolkitRepo.getAudioToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
      );
      return data;
    }
    if (toolkitType === ToolkitType.EPISODES) {
      const data = await this.toolkitRepo.getEpisodesToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
      );
      return data;
    }
    if (toolkitType === ToolkitType.HABIT) {
      const data = await this.toolkitRepo.getHabitsToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
      );
      return data;
    }
    if (toolkitType === ToolkitType.MOOD) {
      const data = await this.toolkitRepo.getMoodToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
      );
      return data;
    }

    if (!titleFormat || !tableName || !emojiField) {
      throw new BadGatewayException(
        `toolkits.title_format_or_emoji_field_not_found`,
      );
    }

    const isSameLogic = noTitleToolkits.includes(toolkitType);
    if (isSameLogic) {
      const data = await this.toolkitRepo.getNoTitleAnswersHistory(
        tableName,
        emojiField,
        userId,
        toolkitId,
        limit,
        offset,
      );
      return data;
    }

    const data = await this.toolkitRepo.getAnswersHistory(
      tableName,
      emojiField,
      titleFormat,
      userId,
      toolkitId,
      limit,
      offset,
    );
    if (
      toolkitType === ToolkitType.SLEEP_CHECK ||
      toolkitType === ToolkitType.SPORT ||
      toolkitType === ToolkitType.ACTIVITY
    ) {
      const mappedData: AnswerHistory[] = data.map((history) => {
        let title = this.convertMinutesToHoursAndMinutes(Number(history.title));
        if (toolkitType === ToolkitType.ACTIVITY) {
          title = this.convertSecondsToMinutesAndSeconds(Number(history.title));
        }
        return {
          title: title,
          session_date: history.session_date,
          emoji: history.emoji,
          session_id: history.session_id,
          toolkit_id: history.toolkit_id,
          schedule_id: history.schedule_id,
        };
      });
      return mappedData;
    }

    return data;
  }

  private async getToolkitAnswersCalender(
    toolkitType: ToolkitType,
    userId: string,
    selectedDate: string,
    toolkitId: string,
    checkinId?: string,
  ): Promise<string[]> {
    const tableName = toolkitAnswerTables.get(toolkitType);
    const titleFormat = answersHistoryTitleFormats.get(toolkitType);
    if (!titleFormat || !tableName) {
      throw new BadGatewayException(`toolkits.title_format_or_name_not_found`);
    }
    const date = new Date(selectedDate);
    const startDate = datefns.startOfMonth(date).toISOString();
    const endDate = datefns.endOfMonth(date).toISOString();
    const data = await this.toolkitRepo.getAnswersCalender(
      tableName,
      userId,
      startDate,
      endDate,
      toolkitId,
      checkinId,
    );
    const days = data.map((day) => `${day.day.toISOString()}`);
    return days;
  }

  async getAnswersHistory(
    args: GetAnswersHistoryArgs,
    userId: string,
    lang: string,
  ): Promise<GetAnswersHistoryResponse> {
    const { id: toolkitId, date, checkinId, page, size } = args;
    const user = await this.toolkitRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException('users.user_not_found');
    }
    if (checkinId) {
      return this.getCheckinToolkitsHistory(args, userId);
    }
    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit) {
      throw new NotFoundException();
    }
    const [streaks, rewards, history, calender] = await Promise.all([
      this.toolkitRepo.getAnswersHistoryStreaks(toolkitId, userId),
      this.toolkitRepo.getRewardsData(userId, toolkitId),
      this.getToolkitAnswersHistory(
        toolkit.tool_kit_type,
        toolkitId,
        userId,
        page,
        size,
      ),
      this.getToolkitAnswersCalender(
        toolkit.tool_kit_type,
        userId,
        date,
        toolkitId,
      ),
    ]);
    if (
      toolkit.tool_kit_type === ToolkitType.RUNNING ||
      toolkit.tool_kit_type === ToolkitType.VIDEO ||
      toolkit.tool_kit_type === ToolkitType.ADDICTION_LOG ||
      toolkit.tool_kit_type === ToolkitType.DRINK_WATER
    ) {
      const mappedHistory = history.map((item) => {
        const translatedToolkit =
          this.translationService.getTranslations<Toolkit>(
            [toolkit],
            ['title'],
            lang,
          );
        return {
          ...item,
          title: translatedToolkit[0].title,
        };
      });

      return {
        streaks,
        rewards: rewards,
        calender,
        history: mappedHistory,
      };
    }
    return {
      streaks,
      rewards: rewards,
      calender,
      history,
    };
  }

  async getToolkitAnswersHistoryCalender(
    args: GetAnswersHistoryCalenderArgs,
    userId: string,
  ): Promise<GetAnswersHistoryCalenderResponse> {
    const { id: toolkitId, date } = args;
    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit) {
      throw new NotFoundException();
    }
    const calender = await this.getToolkitAnswersCalender(
      toolkit.tool_kit_type,
      userId,
      date,
      toolkitId,
    );
    return {
      calender,
    };
  }
  async filterToolkitCategoriesByGoals(
    user_id: string,
    goal_ids: string[],
  ): Promise<ToolkitCategory[]> {
    let categories: ToolkitCategory[] = [];
    const user = await this.toolkitRepo.getUserById(user_id);
    categories = await this.toolkitRepo.getToolkitCategoryByUserId(
      user_id,
      user.age_group,
      goal_ids,
    );
    const duplicateFreeCategories = categories.filter(
      (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i,
    );
    return duplicateFreeCategories;
  }

  async searchToolkits(
    userId: string,
    args: SearchToolkitsArgs,
    role: string,
    lang?: string,
  ): Promise<SearchToolkitsResponse> {
    const user = await this.toolkitRepo.getUserById(userId);
    const { organization_id, age_group } = user;

    if (!organization_id) {
      throw new NotFoundException('toolkits.organization_not_found');
    }

    if (!age_group) {
      throw new NotFoundException('toolkits.age_group_not_found');
    }
    const toolkits = await this.toolkitRepo.searchToolkits(
      args.name,
      organization_id,
      age_group,
      role,
      args.goalIds,
      lang,
    );
    const finalToolkits =
      await this.filterToolkitsByUserMembershipLevelsAndStages(
        userId,
        toolkits,
      );
    return {
      toolkits: finalToolkits,
    };
  }

  private convertHourAndMinutesToMinutes(timeInHour: string): {
    minutes: number;
    timeString: string;
  } {
    const [hour, minutes] = timeInHour.split(':');
    return {
      minutes: Number(hour) * 60 + Number(minutes),
      timeString: `${Number(hour)}h ${Number(minutes)}m`,
    };
  }

  private convertMinutesToHoursAndMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${Number(hours)}h ${Number(minutes)}m`;
  }

  private convertSecondsToMinutesAndSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const secconds = Math.round(totalSeconds % 60);
    return `${Number(minutes)}m ${Number(secconds)}s`;
  }

  private async getNormalToolkitGoalData(
    schedule: Schedule,
    sessionDate: string,
    toolkitType: ToolkitType,
  ): Promise<NormalToolkitGoal> {
    const {
      id: scheduleId,
      repeat_per_day: repeatPerDay,
      user: userId,
    } = schedule;

    const toolKitAnswersTableName = toolkitAnswerTables.get(toolkitType);
    if (!toolKitAnswersTableName) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }
    const totalSessions = repeatPerDay || 1;
    const startDate = datefns.startOfDay(new Date(sessionDate));

    const endDate = datefns.endOfDay(new Date(sessionDate));
    const selectedTable = toolkitSelectedOptionTables.get(toolkitType);
    let toolkitsWithOptions = toolkitTypesWithOptions.includes(toolkitType);

    if (toolkitsWithOptions) {
      toolkitsWithOptions =
        await this.toolkitRepo.isToolkitAnswersOptionsSelected(
          selectedTable as string,
          scheduleId,
          userId,
        );
    }

    if (!toolkitsWithOptions) {
      const completedSessions =
        await this.toolkitRepo.getToolkitAnswerBySessions(
          userId,
          startDate,
          endDate,
          toolKitAnswersTableName,
          scheduleId,
        );
      const progress = Math.ceil((completedSessions / totalSessions) * 100);

      return {
        progress: progress > 100 ? 100 : progress,
        totalSessions: totalSessions.toString(),
        completedSessions: completedSessions.toString(),
      };
    }

    const optionTable = toolkitOptionsTableNames.get(toolkitType);
    const optionField = toolkitOptionsFieldNames.get(toolkitType);
    const selectedField = toolkitOptionsSelectedFieldNames.get(toolkitType);
    const toolkitAnswersValueFieldName =
      toolkitAnswersValueFieldNames.get(toolkitType);

    if (
      !optionTable ||
      !selectedTable ||
      !selectedField ||
      !optionField ||
      !toolkitAnswersValueFieldName
    ) {
      throw new NotFoundException(`toolkits.no_toolkit_option_table_name`);
    }

    let selectedOption: number;
    let timeInString = null;
    const isWeightOrMedicationTool =
      toolkitType === ToolkitType.MEDICATION ||
      toolkitType === ToolkitType.WEIGHT;

    if (isWeightOrMedicationTool) {
      selectedOption =
        await this.toolkitRepo.getWeightAndMedicationToolkitAnswersOptions(
          selectedTable,
          selectedField,
          scheduleId,
        );
    } else {
      selectedOption = await this.toolkitRepo.getToolkitAnswersOptions(
        optionTable,
        optionField,
        selectedTable,
        selectedField,
        scheduleId,
      );
    }

    if (!selectedOption) {
      throw new NotFoundException(`toolkits.toolkit_option_not_found`);
    }

    const isSleepTool = toolkitType === ToolkitType.SLEEP_CHECK;
    if (isSleepTool) {
      //optionValue string example:  12:30 or 10:55
      const { minutes, timeString } = this.convertHourAndMinutesToMinutes(
        selectedOption.toString(),
      );
      selectedOption = minutes;
      timeInString = timeString;
      //timeString example: 12h 30m or 10h 55m
    }

    const completedSessions =
      await this.toolkitRepo.getToolkitAnswersHasOptionsBySessions(
        userId,
        startDate,
        endDate,
        toolKitAnswersTableName,
        toolkitAnswersValueFieldName,
        scheduleId,
      );

    const progress = Math.ceil((completedSessions / selectedOption) * 100);

    const toolkitAnswerResponse: NormalToolkitGoal = {
      progress,
      totalSessions: selectedOption.toString(),
      completedSessions: completedSessions.toString(),
      selectedOption: isSleepTool
        ? (timeInString as string)
        : selectedOption.toString(),
    };
    return toolkitAnswerResponse;
  }

  private checkForCompletedLevel(
    goalLevels: UserGoalLevels[],
    earnedPoints: number,
  ): {
    nextLevel: UserGoalLevels;
    progress: number;
    requiredPoints: number;
    isGoalLevelsCompleted: boolean;
  } {
    const totalPoints = goalLevels
      .filter((level) => level.is_completed)
      .reduce(
        (a, goalLevel) => a + goalLevel.hlp_reward_points_to_complete_goal,
        0,
      );
    let nextLevel = goalLevels.find((level) => level.is_completed === false);
    let isGoalLevelsCompleted = false;
    if (!nextLevel) {
      nextLevel = goalLevels[goalLevels.length - 1];
      isGoalLevelsCompleted = true;
    }
    const { hlp_reward_points_to_complete_goal } = nextLevel;
    const requiredPoints = isGoalLevelsCompleted
      ? totalPoints
      : totalPoints + hlp_reward_points_to_complete_goal;
    const progress = Math.ceil((earnedPoints / requiredPoints) * 100);
    return { nextLevel, progress, requiredPoints, isGoalLevelsCompleted };
  }

  async getMappedToolkitAnswers(
    toolkitAnswers: ToolkitAnswers,
    sessionId: string,
    userId: string,
    toolkitType: ToolkitType,
  ): Promise<ToolkitAnswers> {
    if (toolkitType === ToolkitType.SPORT) {
      const {
        activities: [activities],
        intensities: [intensities],
      } = await this.toolkitRepo.getSportsToolkitActivityAndIntensity(
        sessionId,
        userId,
      );
      return {
        ...toolkitAnswers,
        activities,
        intensities,
      };
    }

    if (toolkitType === ToolkitType.ALCOHOL_INTAKE) {
      const alchohol_type = await this.toolkitRepo.getAlcoholTypes(
        sessionId,
        userId,
      );
      return {
        ...toolkitAnswers,
        alchohol_type,
      };
    }

    return toolkitAnswers;
  }

  async getMappedToolkitAnswersNew(
    toolkitAnswers: ToolkitAnswers,
    sessionId: string,
    userId: string,
    toolkitType: ToolkitType,
  ): Promise<ToolkitAnswers> {
    if (toolkitType === ToolkitType.SPORT) {
      const {
        activities: [activities],
        intensities: [intensities],
      } = await this.toolkitRepo.getSportsToolkitActivityAndIntensity(
        sessionId,
        userId,
      );
      return {
        ...toolkitAnswers,
        activities,
        intensities,
      };
    }

    if (toolkitType === ToolkitType.AUDIO) {
      const played_audio_toolkit_audio_files =
        await this.toolkitRepo.getPlayedAudioToolkitAudioFiles(sessionId);
      return {
        ...toolkitAnswers,
        played_audio_toolkit_audio_files,
      };
    }

    if (toolkitType === ToolkitType.ALCOHOL_INTAKE) {
      const alchohol_type = await this.toolkitRepo.getAlcoholTypes(
        sessionId,
        userId,
      );
      return {
        ...toolkitAnswers,
        alchohol_type,
      };
    }
    if (
      toolkitType === ToolkitType.MOOD &&
      'mood_category_id' in toolkitAnswers
    ) {
      const { mood_category_id, mood_sub_categories } = toolkitAnswers;
      const { mood_check_category, mood_check_sub_category } =
        await this.toolkitRepo.getMoodCategories(
          mood_category_id,
          mood_sub_categories,
        );
      return {
        ...toolkitAnswers,
        mood_check_category,
        mood_check_sub_category,
      };
    }
    return toolkitAnswers;
  }

  async getToolkitHistoryPopup(
    userId: string,
    args: GetToolkitAnswerArgs,
  ): Promise<ToolkitHistoryPopupResponse> {
    const { toolkitId, sessionId, habitId } = args;
    const toolkit = await this.toolkitRepo.getToolkitNew(toolkitId);
    if (!toolkit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }
    const { tool_kit_type: toolkitType, unit: unitId } = toolkit;
    const toolKitAnswersTableName = toolkitAnswerTables.get(toolkitType);
    if (!toolKitAnswersTableName) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }
    const [answerAndSchedule, unit] = await Promise.all([
      this.toolkitRepo.getToolkitAnswerAndScheduleBySessionId(
        sessionId,
        toolKitAnswersTableName,
        userId,
      ),
      this.toolkitRepo.getToolitUnitById(unitId),
    ]);

    if (!answerAndSchedule) {
      throw new NotFoundException(`toolkits.session_not_found`);
    }
    const {
      answer: [toolkitAnswers],
      schedule: [schedule],
    } = answerAndSchedule;
    const mappedAnswers = await this.getMappedToolkitAnswers(
      toolkitAnswers,
      sessionId,
      userId,
      toolkitType,
    );
    const { session_date: sessionDate } = mappedAnswers;
    const { schedule_type } = schedule;
    if (habitId) {
      const goalData = await this.getHabitToolkitGoalData(toolkitId, userId);
      return {
        scheduleType: schedule_type,
        toolkitType: toolkitType,
        goalData,
        goalType: GoalType.HABIT,
        toolkit: toolkit,
      };
    }

    const goalData = await this.getNormalToolkitGoalData(
      schedule,
      sessionDate,
      toolkitType,
    );
    goalData.unit = unit;

    const toolKitHistoryPopup: ToolkitHistoryPopupResponse = {
      scheduleType: schedule_type,
      toolkitType: toolkitType,
      goalType: GoalType.NORMAL,
      goalData: goalData,
      toolkitAnswers: [mappedAnswers],
      toolkit: toolkit,
    };

    return toolKitHistoryPopup;
  }

  async getNormalToolkitGoal(args: GetToolkitArgs): Promise<NormalToolkitGoal> {
    const { id: toolkitId, schedule_id, session_date: sessionDate } = args;
    const [toolkit, schedule] = await Promise.all([
      this.toolkitRepo.getToolkitById(toolkitId),
      this.toolkitRepo.getScheduleByIdNew(schedule_id as string),
    ]);

    if (!toolkit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }
    const { tool_kit_type: toolkitType, unit: unitId } = toolkit;
    const toolKitAnswersTableName = toolkitAnswerTables.get(toolkitType);
    if (!toolKitAnswersTableName) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }

    const [progressBarDetails, unit] = await Promise.all([
      this.getNormalToolkitGoalData(
        schedule,
        sessionDate as string,
        toolkitType,
      ),
      this.toolkitRepo.getToolitUnitById(unitId),
    ]);

    const normalToolkitGoal: NormalToolkitGoal = {
      ...progressBarDetails,
      unit,
    };

    return normalToolkitGoal;
  }

  async getHabitToolkitGoalData(
    toolKitId: string,
    userId: string,
  ): Promise<HabitToolkitGoal> {
    const {
      goal: [goal],
      toolkit: [toolKit],
    } = await this.toolkitRepo.getToolkitAndGoalByToolkitId(toolKitId);

    if (!goal || !toolKit) {
      throw new NotFoundException(`toolkits.toolkit_or_goal_not_found`);
    }

    const [{ session_count: sessionCount }, goalLevels] = await Promise.all([
      this.toolkitRepo.getToolkitSessionCount(toolKitId, userId),
      this.toolkitRepo.getUserGoalLevelsByGoalId(userId, toolKit.goal_id),
    ]);

    const earnedPoints = toolKit.tool_kit_hlp_reward_points * sessionCount;
    const { nextLevel, progress, requiredPoints, isGoalLevelsCompleted } =
      this.checkForCompletedLevel(goalLevels, earnedPoints);

    const habitGoal: HabitToolkitGoal = {
      completedSessions: earnedPoints.toString(),
      totalSessions: requiredPoints.toString(),
      progress: progress,
      goalLevel: `Level ${nextLevel.sequence_number}`,
      goalTitle: goal.title as string,
      isGoalLevelsCompleted: isGoalLevelsCompleted,
      isGoalSelected: nextLevel.is_goal_selected as boolean,
    };
    return habitGoal;
  }

  /**@description Get the history for toolkits answers performed from checkins */
  async getCheckinToolkitsHistory(
    args: GetAnswersHistoryArgs,
    userId: string,
  ): Promise<GetAnswersHistoryResponse> {
    const { id: toolkitId, date, checkinId, page, size } = args;
    if (!checkinId) {
      throw new NotFoundException(`toolkits.checkin_id_not_found`);
    }
    const response = await this.toolkitRepo.getToolkitAndCheckin(
      checkinId,
      toolkitId,
    );
    if (!response) {
      throw new NotFoundException(`toolkits.toolkit_or_Checkin_not_found`);
    }
    const { check_ins, tool_kit: toolkit } = response;
    const [streaks, rewards, history, calender] = await Promise.all([
      this.toolkitRepo.getAnswersHistoryStreaks(toolkitId, userId),
      this.toolkitRepo.getRewardsData(userId, toolkitId),
      this.getCheckinToolkitAnswersHistory(
        toolkit.tool_kit_type,
        toolkitId,
        userId,
        check_ins.id,
        page,
        size,
      ),
      this.getToolkitAnswersCalender(
        toolkit.tool_kit_type,
        userId,
        date,
        toolkitId,
        check_ins.id,
      ),
    ]);
    return {
      streaks,
      rewards: rewards,
      calender,
      history,
    };
  }

  async getCheckinToolkitAnswersHistory(
    toolkitType: ToolkitType,
    toolkitId: string,
    userId: string,
    checkinId: string,
    page?: number,
    size?: number,
  ): Promise<AnswerHistory[]> {
    page = Number(page) || 0;
    const limit = Number(size) || 10;
    const offset = (page - 1 + 1) * limit;
    const tableName = toolkitAnswerTables.get(toolkitType);
    const titleFormat = answersHistoryTitleFormats.get(toolkitType);
    const emojiField = answersHistoryEmojiFields.get(toolkitType);
    if (toolkitType === ToolkitType.FORM) {
      const data = await this.toolkitRepo.getFormsToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
        checkinId,
      );
      return data;
    }
    if (toolkitType === ToolkitType.EPISODES) {
      const data = await this.toolkitRepo.getEpisodesToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
        checkinId,
      );
      return data;
    }
    if (toolkitType === ToolkitType.HABIT) {
      const data = await this.toolkitRepo.getHabitsToolkitHistory(
        userId,
        toolkitId,
        limit,
        offset,
        checkinId,
      );
      return data;
    }
    if (toolkitType === ToolkitType.DRINK_WATER) {
      //This toolkit is not implemented from app side
      return [];
    }

    if (!titleFormat || !tableName || !emojiField) {
      throw new BadGatewayException(
        `toolkits.title_format_or_emoji_field_not_found`,
      );
    }

    const isSameLogic = noTitleToolkits.includes(toolkitType);
    if (isSameLogic) {
      const data = await this.toolkitRepo.getNoTitleAnswersHistory(
        tableName,
        emojiField,
        userId,
        toolkitId,
        limit,
        offset,
        checkinId,
      );
      return data;
    }

    const data = await this.toolkitRepo.getAnswersHistory(
      tableName,
      emojiField,
      titleFormat,
      userId,
      toolkitId,
      limit,
      offset,
      checkinId,
    );
    if (
      toolkitType === ToolkitType.SLEEP_CHECK ||
      toolkitType === ToolkitType.SPORT
    ) {
      const mappedData: AnswerHistory[] = data.map((history) => {
        const title = this.convertMinutesToHoursAndMinutes(
          Number(history.title),
        );
        return {
          title: title,
          session_date: history.session_date,
          emoji: history.emoji,
          session_id: history.session_id,
          toolkit_id: history.toolkit_id,
          schedule_id: history.schedule_id,
        };
      });
      return mappedData;
    }

    return data;
  }

  async getToolkitById(toolKitId: string): Promise<Toolkit> {
    const toolKit = await this.toolkitRepo.getToolkitNew(toolKitId);
    if (!toolKit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }
    return toolKit;
  }

  private getMappedGoalLevels(
    goalLevels: GoalLevelWithStatus[],
    earnedPoints: number,
    goal: Goal,
  ): NormalHabitToolkitGoal {
    let totalPoints = goalLevels
      .filter((level) => level.is_completed)
      .reduce(
        (a, goalLevel) => a + goalLevel.hlp_reward_points_to_complete_goal,
        0,
      );
    let nextLevel = goalLevels.find((level) => level.is_completed === false);

    if (!nextLevel) {
      nextLevel = goalLevels[goalLevels.length - 1];
      goalLevels.pop();
      totalPoints = goalLevels
        .filter((level) => level.is_completed)
        .reduce(
          (a, goalLevel) => a + goalLevel.hlp_reward_points_to_complete_goal,
          0,
        );
    }

    const {
      hlp_reward_points_to_complete_goal: requiredPoints,
      title,
      color,
    } = nextLevel;
    const currentLevelEarnedPoints = Math.max(0, earnedPoints - totalPoints);
    let progress = Math.ceil((currentLevelEarnedPoints / requiredPoints) * 100);
    progress = progress > 100 ? 100 : progress;
    const normalHabitToolkitGoal: NormalHabitToolkitGoal = {
      goalTitle: goal.title,
      goalLevelTitle: title,
      goalEmojiImageFilePath: goal.emoji_image_file_path,
      goalEmojiImageId: goal.emoji_image_id,
      goalEmojiImageUrl: goal.emoji_image_url,
      goalLevelBadgeColor: color,
      progress,
      earnedPoints: currentLevelEarnedPoints,
      requiredPoints,
    };
    return normalHabitToolkitGoal;
  }

  async getToolkitGoalWithOptions(
    toolkitId: string,
    scheduleId: string,
    date: string,
  ): Promise<ToolkitGoalWithOptions | undefined> {
    this.logger.log(toolkitId, scheduleId);
    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }

    const schedule = await this.toolkitRepo.getScheduleByIdNew(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`toolkits.schedule_not_found`);
    }

    const { user: userId } = schedule;
    const { tool_kit_type: toolkitType } = toolkit;
    const selectedTable = toolkitSelectedOptionTables.get(toolkitType);

    const isOptionsSelected =
      await this.toolkitRepo.isToolkitAnswersOptionsSelected(
        selectedTable as string,
        scheduleId,
        userId,
      );
    if (!isOptionsSelected) {
      return;
    }
    const [optionValue, loggedData] = await Promise.all([
      this.toolkitRepo.getSelectedOptionValueByUser(scheduleId, toolkitType),
      this.toolkitRepo.getLoggedToolkitDataBySchedule(
        scheduleId,
        date,
        toolkitType,
      ),
    ]);
    let selectedOption = Number(optionValue);
    if (toolkitType === ToolkitType.SLEEP_CHECK) {
      selectedOption = this.utilService.getTotalMinutesFromTime(optionValue);
    }
    let progress =
      selectedOption <= 0 ? 0 : Math.ceil((loggedData / selectedOption) * 100);

    progress = progress > 100 ? 100 : progress;
    const toolkitGoalWithOptions: ToolkitGoalWithOptions = {
      loggedData,
      selectedOption,
      progress,
      scheduleType: schedule.schedule_type,
    };
    return toolkitGoalWithOptions;
  }

  async getToolkitGoalWithoutOptions(
    toolkitId: string,
    scheduleId: string,
    date: string,
  ): Promise<ToolkitGoalWithoutOptions> {
    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit) {
      throw new NotFoundException('toolkits.toolkit_not_found');
    }

    const schedule = await this.toolkitRepo.getScheduleByIdNew(scheduleId);
    if (!schedule) {
      throw new NotFoundException('toolkits.schedule_not_found');
    }

    const { repeat_per_day: repeatPerDay, user: userId } = schedule;
    const { tool_kit_type: toolkitType } = toolkit;

    const totalSessions = repeatPerDay || 1;
    const completedSessions =
      await this.toolkitRepo.getToolkitCompletedSessionsCount(
        userId,
        scheduleId,
        date,
        toolkitType,
      );
    let progress = Math.ceil((completedSessions / totalSessions) * 100);
    progress = progress > 100 ? 100 : progress;
    const toolkitGoalWithoutOptions: ToolkitGoalWithoutOptions = {
      totalSessions,
      completedSessions,
      progress,
      scheduleType: schedule.schedule_type,
    };

    return toolkitGoalWithoutOptions;
  }

  async getNormalHabitToolkitGoal(
    goalId: string,
    userId: string,
    lang?: string,
  ): Promise<NormalHabitToolkitGoal | undefined> {
    const goal = await this.toolkitRepo.getGoalById(goalId);
    if (!goal) {
      throw new NotFoundException(`toolkits.goal_not_found`);
    }
    const [translatedGoal] = this.translationService.getTranslations<Goal>(
      [goal],
      ['title', 'description'],
      lang,
    );

    const [{ points: earnedPoints }, goalLevels] = await Promise.all([
      this.goalsService.getGoalPoint(goalId, userId),
      this.toolkitRepo.getUserGoalLevelsWithStatus(userId, goalId, lang),
    ]);
    if (!goalLevels.length) {
      return;
    }
    return this.getMappedGoalLevels(goalLevels, earnedPoints, translatedGoal);
  }

  async getToolkitGoalDetails(
    toolkitId: string,
    userId: string,
    scheduleId: string,
    date?: string,
    lang?: string,
  ): Promise<ToolkitGoalData | undefined> {
    date = (date as string) || (DateTime.utc().toISODate() as string);
    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit) {
      throw new NotFoundException('toolkits.toolkit_not_found');
    }

    const schedule = await this.toolkitRepo.getScheduleByIdNew(scheduleId);
    if (!schedule) {
      throw new NotFoundException(`toolkits.schedule_not_found`);
    }

    const { tool_kit_type: toolkitType, goal_id: goalId } = toolkit;
    const isToolkitWithOptions = toolkitsWithOptions.includes(toolkitType);
    const isToolkitsWithoutOptions =
      toolkitsWithoutOptions.includes(toolkitType);
    const isNormalHabitToolkits = normalHabitToolkits.includes(toolkitType);

    if (isToolkitWithOptions) {
      return this.getToolkitGoalWithOptions(toolkitId, scheduleId, date);
    }

    if (isToolkitsWithoutOptions) {
      return this.getToolkitGoalWithoutOptions(toolkitId, scheduleId, date);
    }

    if (isNormalHabitToolkits) {
      return this.getNormalHabitToolkitGoal(goalId, userId, lang);
    }
  }

  async filterToolkitsByUserMembershipLevelsAndStages(
    userId: string,
    toolkits: Toolkit[],
  ): Promise<Toolkit[]> {
    const [userMembershipLevels, UserMembershipStages] = await Promise.all([
      this.toolkitRepo.getUserMembershipLevels(userId),
      this.toolkitRepo.getUserMembershipStages(userId),
    ]);
    const userMembershipStgeIds = UserMembershipStages.map(
      (stage) => stage.membership_stage_id,
    );
    const userMembershipLevelIds = userMembershipLevels.map(
      (level) => level.membership_level_id,
    );
    const filteredToolkits = toolkits.filter((toolkit) => {
      if (toolkit.membership_level_id && toolkit.membership_stage_id) {
        const hasLevel = userMembershipLevelIds.includes(
          toolkit.membership_level_id,
        );
        const hasStage = userMembershipStgeIds.includes(
          toolkit.membership_stage_id,
        );
        return hasStage && hasLevel;
      }

      if (toolkit.membership_level_id) {
        return userMembershipLevelIds.includes(toolkit.membership_level_id);
      }
      if (toolkit.membership_stage_id) {
        return userMembershipStgeIds.includes(toolkit.membership_stage_id);
      }
      return true;
    });

    return filteredToolkits;
  }

  async getToolkitAnswer(
    userId: string,
    args: GetToolkitAnswerArgs,
  ): Promise<GetToolkitAnswerResponse> {
    const { toolkitId, sessionId } = args;
    const toolkit = await this.toolkitRepo.getToolkitNew(toolkitId);
    if (!toolkit) {
      throw new NotFoundException(`toolkits.toolkit_not_found`);
    }
    const { tool_kit_type: toolkitType } = toolkit;
    const toolKitAnswersTableName = toolkitAnswerTables.get(toolkitType);
    if (!toolKitAnswersTableName) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }
    const answerAndSchedule =
      await this.toolkitRepo.getToolkitAnswerAndScheduleBySessionId(
        sessionId,
        toolKitAnswersTableName,
        userId,
      );

    if (!answerAndSchedule) {
      throw new NotFoundException(`toolkits.session_not_found`);
    }
    const {
      answer: [toolkitAnswer],
      schedule: [schedule],
    } = answerAndSchedule;
    const mappedAnswers = await this.getMappedToolkitAnswersNew(
      toolkitAnswer,
      sessionId,
      userId,
      toolkitType,
    );
    const { session_date: sessionDate } = mappedAnswers;
    const { id: scheduleId } = schedule;

    const goalData = await this.getToolkitGoalDetails(
      toolkitId,
      userId,
      scheduleId,
      sessionDate,
    );
    const getToolkitAnswerResponse: GetToolkitAnswerResponse = {
      toolkit,
      toolkitAnswer: mappedAnswers,
      goalData,
    };
    return getToolkitAnswerResponse;
  }

  async getEpisodeTools(
    toolkit: Toolkit,
    scheduleId: string,
    episodeSessionId: string,
  ): Promise<EpisodeTool[] | undefined> {
    let episodeToolsRequest: [
      (Promise<EpisodeVideoWithStatus[]> | Promise<EpisodeFormWithStatus[]>)?,
    ] = [];
    const isEpisodeVideoTool =
      toolkit.episode_type && toolkit.episode_type === EpisodeType.VIDEOS;
    if (isEpisodeVideoTool) {
      episodeToolsRequest = [
        this.toolkitRepo.getEpisodeToolkitVideoWithStatus(
          toolkit.id,
          scheduleId,
          episodeSessionId,
        ),
      ];
    }
    if (!isEpisodeVideoTool) {
      episodeToolsRequest = [
        this.toolkitRepo.getEpisodeToolkitFormsWithStatus(
          toolkit.id,
          scheduleId,
          episodeSessionId,
        ),
      ];
    }
    const [episodeTools] = await Promise.all(episodeToolsRequest);
    const mappedEpisodeTools = episodeTools?.map(
      (tool): EpisodeTool => ({
        id: tool.id,
        description: tool.description,
        title: tool.title,
        tool_kit_id: tool.tool_kit_id,
        episode_id: tool.episode_id,
        is_completed: tool.is_completed,
        hlp_reward_points: tool.hlp_reward_points,
        episode_type: toolkit.episode_type ?? EpisodeType.FORMS,
        session_id: tool.session_id,
      }),
    );
    return mappedEpisodeTools;
  }

  async getEpisodeToolkitDetails(
    args: GetEpisodeToolkitDetailsArgs,
  ): Promise<GetEpisodeToolkitDetailsResponse> {
    const {
      schedule_id: scheduleId,
      toolkit_id: toolkitId,
      episode_session_id,
    } = args;

    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit || toolkit.tool_kit_type !== ToolkitType.EPISODES) {
      throw new BadRequestException(`toolkits.invalid_episode_toolkit_id`);
    }

    /**
     * get schedule and episode_session_id
     */
    let requests: [Promise<Schedule>?, Promise<EpisodeToolAnswer>?] = [];
    if (scheduleId) {
      const scheduleRequest = this.toolkitRepo.getScheduleByIdNew(scheduleId);
      const tableName: EpisodeToolAnswerTable = toolkit.episode_type
        ? EPISODE_TOOLS_ANSWER_TABLE[toolkit.episode_type]
        : EPISODE_TOOLS_ANSWER_TABLE.FORMS;
      const episodeSessionRequest = this.toolkitRepo.getEpisodeSession(
        scheduleId,
        tableName,
        episode_session_id,
      );
      requests = [scheduleRequest, episodeSessionRequest];
    }

    const [schedule, episodeSession] = await Promise.all(requests);

    let episodeSessionId: string;

    if (episodeSession && episodeSession.episode_session_id) {
      episodeSessionId = episodeSession.episode_session_id;
    } else {
      episodeSessionId = uuidv4();
    }

    /**
     * if user has submitted episodeToolkitAnswer for previous episode_session_id then generate new episode_session_id
     */
    const episodeToolkitAnswer = await this.toolkitRepo.getEpisodeToolkitAnswer(
      scheduleId,
      episodeSessionId,
    );

    if (!episode_session_id && episodeToolkitAnswer) {
      episodeSessionId = uuidv4();
    }

    const episodeTools = await this.getEpisodeTools(
      toolkit,
      scheduleId,
      episodeSessionId,
    );

    const isAllFormsSubmitted =
      (episodeTools &&
        episodeTools.every((episodeForm) => episodeForm.is_completed)) ??
      false;

    return {
      toolkit,
      schedule,
      episode_session_id: episodeSessionId,
      episode_tools: episodeTools,
      is_completed: isAllFormsSubmitted,
    };
  }

  async savePlayedAudioToolkitAudioFile(
    input: SavePlayedAudioToolkitAudioFileInput,
  ): Promise<SavePlayedAudioToolkitAudioFileResponse> {
    const { schedule_id, audio_file_id, session_id } = input;
    const isAlreadyPlayed = await this.toolkitRepo.isAudioAlreadyPlayed(
      schedule_id,
      session_id,
      audio_file_id,
    );
    if (isAlreadyPlayed) {
      const played_audio_toolkit_audio_file =
        await this.toolkitRepo.updatePlayedAudioToolkitAudioFile(input);
      return {
        played_audio_toolkit_audio_file,
      };
    }
    const [schedule, audioToolkitFile] = await Promise.all([
      this.toolkitRepo.getScheduleByIdNew(schedule_id),
      this.toolkitRepo.getAudioToolkitFileById(audio_file_id),
    ]);
    if (!schedule) {
      throw new NotFoundException(`toolkits.schedule_not_found`);
    }
    if (!audioToolkitFile) {
      throw new NotFoundException(`toolkits.audio_toolkit_file_not_found`);
    }

    const played_audio_toolkit_audio_file =
      await this.toolkitRepo.savePlayedAudioToolkitAudioFile(input);
    if (!played_audio_toolkit_audio_file) {
      throw new BadRequestException(
        `toolkits.failed_to_save_played_audio_file`,
      );
    }
    return {
      played_audio_toolkit_audio_file,
    };
  }

  async getAudioToolkitOptionsAndSession(
    scheduleId: string,
    toolkitId: string,
  ): Promise<{
    audioToolkitFiles: AudioToolkitFileWithStatus[];
    sessionId: string;
  }> {
    const audioSession = await this.toolkitRepo.getPlayedAudioToolkitFile(
      scheduleId,
    );

    const hasSessionId = audioSession && audioSession.session_id;
    let sessionId = hasSessionId ?? uuidv4();

    const audioToolkitAnswer = await this.toolkitRepo.getAudioToolkitAnswer(
      scheduleId,
      sessionId,
    );

    if (audioToolkitAnswer) {
      sessionId = uuidv4();
    }
    const audioToolkitFiles =
      await this.toolkitRepo.getAudioToolkitFilesWithStatus(
        toolkitId,
        sessionId,
        scheduleId,
      );

    return {
      audioToolkitFiles,
      sessionId,
    };
  }

  async getAudioToolkitDetails(
    args: GetAudioToolkitDetailsArgs,
  ): Promise<GetAudioToolkitDetailsResponse> {
    const { schedule_id: scheduleId, toolkit_id: toolkitId } = args;
    const toolkit = await this.toolkitRepo.getToolkitById(toolkitId);
    if (!toolkit) {
      throw new BadRequestException(`toolkits.toolkit_not_found`);
    }

    let requests: [
      Promise<Schedule>?,
      Promise<PlayedAudioToolkitAudioFile | undefined>?,
    ] = [];
    if (scheduleId) {
      const scheduleRequest = this.toolkitRepo.getScheduleByIdNew(scheduleId);
      const sessionRequest =
        this.toolkitRepo.getPlayedAudioToolkitFile(scheduleId);
      requests = [scheduleRequest, sessionRequest];
    }
    const [schedule, audioSession] = await Promise.all(requests);
    let sessionId = uuidv4();
    if (audioSession && audioSession.session_id) {
      const episodeToolkitAnswer = await this.toolkitRepo.getAudioToolkitAnswer(
        scheduleId,
        audioSession.session_id,
      );
      sessionId = !episodeToolkitAnswer ? audioSession.session_id : sessionId;
    }

    const audioToolkitFiles =
      await this.toolkitRepo.getAudioToolkitFilesWithStatus(
        toolkit.id,
        sessionId,
        scheduleId,
      );

    const is_completed =
      (audioToolkitFiles &&
        audioToolkitFiles.every(
          (audioToolkitFile) => audioToolkitFile.is_completed,
        )) ??
      false;

    return {
      toolkit,
      schedule,
      audio_toolkit_files: audioToolkitFiles,
      session_id: sessionId,
      is_completed,
    };
  }

  async saveUserToolkitAnswer(
    userId: string,
    input: SaveUserToolkitAnswerInput,
  ): Promise<SaveUserToolkitAnswerResponse> {
    const { schedule_id, toolkit_id, session_date } = input;

    const [userToolkit, schedule] = await Promise.all([
      this.toolkitRepo.getUserToolkitById(toolkit_id),
      this.toolkitRepo.getScheduleByIdNew(schedule_id),
    ]);

    if (!userToolkit) {
      throw new NotFoundException(`toolkits.user_toolkit_not_found`);
    }
    if (!schedule) {
      throw new NotFoundException(`toolkits.schedule_not_found`);
    }
    const sessionDate = session_date
      ? session_date
      : this.utilService.getISODateString(new Date());
    const insertInput: InsertUserToolkitAnswerInput = {
      ...input,
      user_id: userId,
      hlp_points_earned: 1,
      session_date: sessionDate,
    };
    await this.toolkitRepo.insertUserToolkitAnswer(insertInput);
    return {
      message: this.translationService.translate(
        `toolkits.user_toolkit_answer_saved`,
      ),
    };
  }

  async getAppointmentDetails(
    userId: string,
    args: GetAppointmentDetailsArgs,
    lang: string,
  ): Promise<GetAppointmentDetailsResponse> {
    const { schedule_id: scheduleId, date } = args;

    const schedule = await this.toolkitRepo.getScheduleByScheduleId(scheduleId);

    const translatedAppointmentTitle = this.translationService.translate(
      `appointment.type.${schedule.user_appointment_title}`,
      {},
    );
    if (!schedule || !schedule.user_appointment_id) {
      throw new NotFoundException(`toolkits.appointment_schedule_not_found`);
    }

    const userAppointment = await this.toolkitRepo.getUserAppointment(
      schedule.user_appointment_id,
      userId,
    );

    if (!userAppointment) {
      throw new BadRequestException(`toolkits.invalid_user_appointment`);
    }

    const appointmentSession = await this.toolkitRepo.getAppointmentSession(
      schedule.id,
      schedule.user_appointment_id,
    );

    const hasSessionId =
      appointmentSession && appointmentSession.appointment_session_id;

    const appointmentSessionId = hasSessionId ?? uuidv4();

    const formWithStatus = await this.toolkitRepo.getFormsWithStatus(
      schedule.id,
      schedule.user_appointment_id,
      date,
      lang,
      appointmentSessionId,
    );
    return {
      schedule: {
        ...schedule,
        user_appointment_title: translatedAppointmentTitle,
      },
      user_appointment_details: userAppointment,
      forms_with_status: formWithStatus,
      appointment_session_id: appointmentSessionId,
      explain_appointment: this.translationService.translate(
        `constant.explain_appointment`,
      ),
    };
  }

  async saveUserAppointmentAnswer(
    userId: string,
    input: SaveUserAppointmentAnswerInput,
  ): Promise<SaveUserToolkitAnswerResponse> {
    const { appointment_session_id, session_date, ...userAppointmentInput } =
      input;

    const userAppointmentSchedule =
      await this.toolkitRepo.getUserAppointmentSchedule(
        input.schedule_id,
        input.appointment_id,
      );

    if (!userAppointmentSchedule) {
      throw new NotFoundException(
        `toolkits.user_appointment_schedule_not_found`,
      );
    }
    const { schedule } = userAppointmentSchedule;
    const totalEarnedPoint = await this.toolkitRepo.getTotalEarnedPoint(
      schedule.id,
      userId,
    );

    const insertInput: InsertUserAppointmentAnswerInput = {
      ...userAppointmentInput,
      session_id: appointment_session_id,
      user_id: userId,
      hlp_points_earned: totalEarnedPoint,
      id: ulid(),
      session_time: this.utilService.getTimeInHourAndMinutes(
        new Date().toISOString().slice(11, 16),
      ),
      session_date: session_date
        ? session_date
        : this.utilService.getISODateString(new Date()),
    };
    await this.toolkitRepo.insertUserAppointmentAnswer(insertInput);

    return {
      message: this.translationService.translate(
        `toolkits.user_appointment_answer_saved`,
      ),
    };
  }

  async getAppointmentHistory(
    userId: string,
    args: GetAppointmentHistoryArgs,
  ): Promise<GetAppointmentHistoryResponse> {
    const { date, page, limit } = args;
    const selectedDate = new Date(date);
    const startDate = datefns.startOfMonth(selectedDate).toISOString();
    const endDate = datefns.endOfMonth(selectedDate).toISOString();
    const [earnedPoint, { history, total }, calender] = await Promise.all([
      this.toolkitRepo.getEarnedPointData(userId),
      this.toolkitRepo.getAppointmentHistory(userId, page, limit),
      this.toolkitRepo.getUserAppointmentCalender(userId, startDate, endDate),
    ]);
    const days = calender.map((day) => `${day.day.toISOString()}`);
    const hasMore = page * limit < total;
    return {
      earnedPoints: earnedPoint,
      hasMore,
      userAppointmentAnswerHistory: history,
      calender: days,
    };
  }

  async getFormToolkitDetails(
    args: GetFormToolkitDetailsArgs,
    lang: string,
  ): Promise<GetFormToolkitDetailResponse> {
    const { schedule_id: scheduleId, toolkit_id: toolkitId, date } = args;
    const formToolkitDetails = await this.toolkitRepo.getFormToolkitDetails(
      scheduleId,
      toolkitId,
      date,
      lang,
    );
    if (!formToolkitDetails) {
      throw new BadRequestException(`toolkits.tool_kit_detail_not_found`);
    }
    let formSessions = formToolkitDetails.form_sessions;
    if (!formSessions) {
      formSessions = [];
    }
    const { schedule } = formToolkitDetails;
    const repeatPerDay = schedule?.repeat_per_day || 1;
    if (repeatPerDay > 7) {
      throw new Error(`toolkits.repeat_per_day_exceed_limit`);
    }

    while (formSessions.length < repeatPerDay) {
      const session = {
        ...formSessions[0],
        is_completed: false,
        session_id: undefined,
      };
      formSessions.push(session);
    }
    return {
      form_toolkit_details: {
        ...formToolkitDetails,
        form_sessions: formSessions,
      },
    };
  }

  async validateAddictionToolkitInput(
    saveToolkitAnswerInput: SaveToolkitAnswerInput,
  ): Promise<void> {
    const userScheduleSessions =
      await this.toolkitRepo.getUserScheduleSessionBySessionDate(
        saveToolkitAnswerInput.schedule_id,
        saveToolkitAnswerInput.session_date,
      );

    if (userScheduleSessions.length) {
      throw new BadRequestException(`toolkits.session_already_completed`);
    }
  }

  async validateToolkitAnswerInput(
    userId: string,
    input: SaveToolkitAnswersInput,
    toolkit: Toolkit,
  ): Promise<SaveToolkitAnswerInput> {
    const { id, tool_kit_hlp_reward_points } = toolkit;
    const { toolkit_answer_input, ...commonInput } = input;

    const inputField = toolkitAnswerInputFields.get(toolkit.tool_kit_type);
    if (!inputField) {
      throw new NotFoundException(`toolkits.no_toolkit_answers_table_name`);
    }
    const toolkitAnswerInput = toolkit_answer_input[inputField];

    if (!toolkitAnswerInput) {
      throw new BadRequestException(`toolkits.no_toolkit_answer_input_found`);
    }

    const saveToolkitAnswerInput: SaveToolkitAnswerInput = {
      user_id: userId,
      hlp_points_earned: tool_kit_hlp_reward_points,
      tool_kit_id: id,
      ...commonInput,
      ...toolkitAnswerInput,
    };

    if (toolkit.tool_kit_type === ToolkitType.ADDICTION_LOG) {
      await this.validateAddictionToolkitInput(saveToolkitAnswerInput);

      if (saveToolkitAnswerInput.addiction_log_answer) {
        const latestToolkitAnswer =
          await this.toolkitRepo.getLatestToolkitAnswerByScheduleId<AddictionLogToolkitAnswer>(
            saveToolkitAnswerInput.schedule_id,
            toolkit.tool_kit_type,
          );
        saveToolkitAnswerInput.days_without_addiction = latestToolkitAnswer
          ? latestToolkitAnswer.days_without_addiction + 1
          : 0;
      }
    }

    return saveToolkitAnswerInput;
  }

  async saveToolkitAnswer(
    userId: string,
    input: SaveToolkitAnswersInput,
  ): Promise<SaveToolkitAnswerResponse> {
    const { schedule_id } = input;

    const schedule = await this.toolkitRepo.getScheduleWithToolkit(
      schedule_id,
      userId,
    );

    if (!schedule) {
      throw new NotFoundException(`toolkits.schedule_not_found`);
    }
    if (!schedule?.toolkit) {
      throw new BadRequestException(`toolkits.toolkit_not_found`);
    }
    const { toolkit } = schedule;

    const toolkitAnswerInput = await this.validateToolkitAnswerInput(
      userId,
      input,
      toolkit,
    );

    const tookitAnswer = await this.toolkitRepo.insertToolkitAnswer(
      toolkitAnswerInput,
      toolkit.tool_kit_type,
    );

    return {
      message: this.translationService.translate(
        `toolkits.toolkit_answer_saved`,
      ),
      data: { id: tookitAnswer.id, schedule_id: schedule_id },
    };
  }

  async getAllToolkitsHistory(
    userId: string,
    args: GetAllToolkitsHistoryArgs,
    lang: string,
  ): Promise<GetAllToolkitsHistoryResponse> {
    const { page, limit } = args;
    const { allToolkitsHistory, total } =
      await this.toolkitRepo.getAllToolkitsHistory(userId, page, limit, lang);
    const hasMore = args.page * args.limit < total;
    return { allToolkitsHistory, hasMore };
  }
}
