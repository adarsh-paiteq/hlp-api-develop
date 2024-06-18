import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DateTime, Info } from 'luxon';
import { GoalsService } from '../goals/goals.service';
import { Toolkit } from '../toolkits/toolkits.model';
import {
  ActivityVsMood,
  ActivityVsMoodGraph,
  AverageActivity,
  StepsVsMood,
  StepsVsMoodGraph,
} from './dto/activity-insights.dto';
import {
  GetActivityInsightsArgsDto,
  GetActivityInsightsResponse,
  GetInsightsResponse,
  GetMoodInsightsArgsDto,
  GetMoodInsightsResponse,
  GetSleepInsightsArgsDto,
  GetSleepInsightsResponse,
  InsightRange,
} from './dto/insights.dto';
import {
  AvegrageDailyMood,
  AvegrageDailyMoodGraph,
  AvegrageMood,
  DailyMoodBarGraph,
  Feelings,
  FeelingsCount,
  MedicationVsMood,
  MoodChartData,
  shortWeekDays,
  MoodInsightsChart,
  MoodInsightsStats,
  moodRankings,
  longWeekDays,
} from './dto/mood-insights.dto';
import {
  SleepHourVsMood,
  SleepHourVsMoodGraph,
  SLEET_TIME_FIELDS,
} from './dto/sleep-insights.dto';
import { InsightsRepo } from './insights.repo';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private readonly insightsRepo: InsightsRepo,
    private readonly goalsService: GoalsService,
    private readonly translationService: TranslationService,
  ) {}

  async getInsights(userId: string): Promise<GetInsightsResponse> {
    const limit = 3;
    const [moodChart, averageStepsAndSleep, { levels }] = await Promise.all([
      this.getMoodInsightsChart(userId),
      this.getAverageStepsAndSleepHours(userId),
      this.goalsService.getGoalLevels(userId, limit),
    ]);
    const { averageInBedTime, averageSteps } = averageStepsAndSleep;
    return {
      insights: {
        goalLevels: levels,
        moodChart: moodChart,
        averageInBedTime,
        averageSteps,
      },
    };
  }

  private getInsightRange(
    date: string,
    range: InsightRange,
  ): { startDate: string; endDate: string } {
    const inputDateTime = DateTime.fromISO(date);
    const endDate = inputDateTime.toISODate() as string;
    let startDate = inputDateTime.minus({ day: 6 }).toISODate() as string;
    if (range === InsightRange.WEEK) {
      return { startDate, endDate };
    }
    if (range === InsightRange.MONTH) {
      startDate = inputDateTime.minus({ days: 30 }).toISODate() as string;
      return { startDate, endDate };
    }

    startDate = inputDateTime
      .plus({ months: 1 })
      .minus({ year: 1 })
      .startOf('month')
      .toISODate() as string;
    return { startDate, endDate };
  }

  async getMoodInsights(
    userId: string,
    args: GetMoodInsightsArgsDto,
  ): Promise<GetMoodInsightsResponse> {
    const { date, range, toolkitId } = args;

    const { startDate, endDate } = this.getInsightRange(date, range);
    const [
      moodChart,
      { negativeFeelings, positiveFeelings },
      medicationMoodLogs,
      moodInsightsStats,
      effectiveTools,
      averageMoods,
      dailyMoodGraph,
    ] = await Promise.all([
      this.getMoodChartByRange(userId, startDate, endDate, range, toolkitId),
      this.getPositiveAndNegativeFeelings(userId, startDate, endDate),
      this.getMedicationMoodLogs(userId, startDate, endDate),
      this.getMoodInsightsStats(userId, startDate, endDate),
      this.getEffectiveToolkits(userId, startDate, endDate),
      this.getMostLoggedMoodAverages(userId, startDate, endDate),
      this.getAverageDailyMoodGraph(userId, startDate, endDate),
    ]);

    return {
      range: range,
      moodInsights: {
        stats: moodInsightsStats,
        moodChart: moodChart,
        averageMood: averageMoods,
        averageDailyMood: dailyMoodGraph,
        positiveFeelings: positiveFeelings,
        negativeFeelings: negativeFeelings,
        effectiveTools: effectiveTools,
        medicationVsMood: medicationMoodLogs,
      },
    };
  }

  private async getNightActivity(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<string[]> {
    const activities = await this.insightsRepo.getNightActivity(
      userId,
      startDate,
      endDate,
    );
    if (!activities) {
      return [];
    }
    const mappedActivites = activities.map(({ activity }) => activity);
    return mappedActivites;
  }

  private async getAverageSleepTime(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    inBedTime: string;
    wakeUpTime: string;
  }> {
    const times = {
      inBedTime: '00h:00m',
      wakeUpTime: '00h:00m',
    };
    const [inBedTime, wakeupTime] = await Promise.all([
      this.insightsRepo.getSleepAverageTime(
        userId,
        startDate,
        endDate,
        SLEET_TIME_FIELDS.IN_BED_TIME,
      ),
      this.insightsRepo.getSleepAverageTime(
        userId,
        startDate,
        endDate,
        SLEET_TIME_FIELDS.WAKE_UP_TIME,
      ),
    ]);
    if (inBedTime) {
      this.logger.log(inBedTime);
      const inBedTimeDate = DateTime.fromSQL(inBedTime);
      const timeString = inBedTimeDate.toFormat('hh:mm');
      times['inBedTime'] = timeString;
    }

    if (wakeupTime) {
      this.logger.log(wakeupTime);
      const inBedTimeDate = DateTime.fromSQL(wakeupTime);
      const timeString = inBedTimeDate.toFormat('hh:mm');
      times['wakeUpTime'] = timeString;
    }
    return times;
  }

  async getSleepInsights(
    userId: string,
    args: GetSleepInsightsArgsDto,
  ): Promise<GetSleepInsightsResponse> {
    const { startDate, endDate } = this.getInsightRange(args.date, args.range);
    const { range } = args;
    const [
      sleepHourVsMood,
      nightActivity,
      { inBedTime, wakeUpTime },
      { deepSleep, sleepHours },
    ] = await Promise.all([
      this.getSleepVsMoodGraph(userId, startDate, endDate),
      this.getNightActivity(userId, startDate, endDate),
      this.getAverageSleepTime(userId, startDate, endDate),
      this.getAverageDeepAndTotalSleep(userId, startDate, endDate),
    ]);

    return {
      range: range,
      sleepInsights: {
        averageSleep: {
          deepSleep,
          inBedTime,
          sleepHours,
          wakeUpTime,
        },
        sleepHourVsMood: sleepHourVsMood,
        nightActivity,
      },
    };
  }

  async getActivityInsights(
    userId: string,
    args: GetActivityInsightsArgsDto,
  ): Promise<GetActivityInsightsResponse> {
    const { date, range } = args;
    const { startDate, endDate } = this.getInsightRange(date, range);
    const [averageActivity, stepsVsMood, activityVsMood] = await Promise.all([
      this.getAverageActivity(userId, startDate, endDate),
      this.getStepsVsMoodGraph(userId, startDate, endDate),
      this.getActivityVsMoodGraph(userId, startDate, endDate),
    ]);
    return {
      range: range,
      activityInsights: {
        averageActivity: averageActivity,
        stepsVsMood: stepsVsMood,
        activityVsMood: activityVsMood,
      },
    };
  }

  async getMoodInsightsStats(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<MoodInsightsStats> {
    const moodInsightsStats = await Promise.all([
      this.insightsRepo.getUserMoodEntries(userId, startDate, endDate),
      this.insightsRepo.getMoodCheckLongestStreak(userId, startDate, endDate),
    ]);

    if (!moodInsightsStats.length) {
      throw new NotFoundException(`insights.mood_insights_stats_not_found`);
    }
    const [{ mood_entries }, { longest_streak }] = moodInsightsStats;
    return {
      longestStreak: longest_streak,
      moodEntries: mood_entries,
    };
  }

  async getMoodInsightsChart(userId: string): Promise<MoodInsightsChart> {
    const user = await this.insightsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`insights.user_not_found`);
    }
    const date = DateTime.fromJSDate(new Date(user.created_at));
    const startDate = date.toISODate() as string;
    const endDate = DateTime.fromJSDate(new Date()).toISODate() as string;
    const chartData = await this.insightsRepo.getMoodInsightsChart(
      userId,
      startDate,
      endDate,
    );
    const isEmpty = !chartData.length ? true : false;

    const totalDays: string[] = [];
    let tempDate = DateTime.fromISO(startDate);
    const lastDate = DateTime.fromISO(endDate);

    while (tempDate <= lastDate) {
      totalDays.push(tempDate.toISODate() as string);
      tempDate = tempDate.plus({ days: 1 });
    }

    const mappedChartData = totalDays.map((day) => {
      const match = chartData.find(
        (data) => day === DateTime.fromJSDate(new Date(data.label)).toISODate(),
      );
      if (!match) {
        const date = DateTime.fromISO(day);
        return {
          value: 0,
          label: `${date.day}/${date.month}`,
        };
      }
      const date = DateTime.fromJSDate(new Date(match.label));
      const value = match.value ? Number(match.value) : 0;
      const label = `${date.day}/${date.month}`;
      return {
        value,
        label,
      };
    });
    return { chartData: mappedChartData, isEmpty };
  }

  private convertMinutesToHoursAndMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const translatedHour = this.translationService.translate(`constant.hour`);
    return `${Number(hours)}${translatedHour} ${Number(minutes)}m`;
  }

  private convertSecondsToMinutesAndSeconds(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const secconds = Math.round(totalSeconds % 60);
    return `${Number(minutes)}m ${Number(secconds)}s`;
  }

  async getAverageStepsAndSleepHours(
    userId: string,
  ): Promise<{ averageSteps: number; averageInBedTime: string }> {
    const [avgSteps, avgSleepTime] = await Promise.all([
      this.insightsRepo.getAverageSteps(userId),
      this.insightsRepo.getAverageSleep(userId),
    ]);

    if (!avgSteps || !avgSleepTime) {
      throw new NotFoundException(
        `insights.average_steps_and_sleep_data_found`,
      );
    }

    return {
      averageSteps: avgSteps.avg_steps,
      averageInBedTime: this.convertMinutesToHoursAndMinutes(
        avgSleepTime.avg_sleep_time,
      ),
    };
  }

  async getPositiveAndNegativeFeelings(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Feelings> {
    const feelings = await this.insightsRepo.getPositiveAndNegativeFeelings(
      userId,
      startDate,
      endDate,
    );
    return feelings;
  }
  private mapMoodLogs(moodLogs: FeelingsCount[]): number[] {
    const moods: number[] = [];
    //Sequence to push data is important
    moods.push(moodLogs.reduce((a, log) => Number(a) + Number(log.awful), 0));
    moods.push(moodLogs.reduce((a, log) => Number(a) + Number(log.bad), 0));
    moods.push(moodLogs.reduce((a, log) => Number(a) + Number(log.mwahh), 0));
    moods.push(moodLogs.reduce((a, log) => Number(a) + Number(log.good), 0));
    moods.push(moodLogs.reduce((a, log) => Number(a) + Number(log.amazing), 0));
    return moods;
  }

  async getMedicationMoodLogs(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<MedicationVsMood[]> {
    const moodLogs = await this.insightsRepo.getMedicationMoodLogs(
      userId,
      startDate,
      endDate,
    );
    const moods = this.mapMoodLogs(moodLogs);
    const total = moods.reduce((a, b) => a + b, 0);

    const medicationVsMood: MedicationVsMood[] = moods.map((mood, index) => {
      if (total === 0) {
        return {
          label: index,
          value: `${total}%`,
        };
      }
      const value = Math.round((Number(mood) / Number(total)) * 100);
      return {
        label: index,
        value: `${value}%`,
      };
    });
    return medicationVsMood;
  }

  async getEffectiveToolkits(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Toolkit[]> {
    const response = await this.insightsRepo.getEffectiveToolkits(
      userId,
      startDate,
      endDate,
    );
    const effectiveTools: Toolkit[] = response.map((tool) => {
      return tool.toolkits;
    });

    return effectiveTools;
  }

  /**
   * @description  we using ISODOW to extract Day of the week which
   * starts as Monday (1) to Sunday (7) to map Mon to Sun data
   * we use Info.weekdays('short')[day - 1] so that we can map the week day with the data
   */
  private getMoodChartDataByWeek(
    startDate: string,
    endDate: string,
    chartData: MoodChartData[],
  ): MoodChartData[] {
    const weekDays: number[] = [];
    let tempDate = DateTime.fromISO(startDate);
    const lastDate = DateTime.fromISO(endDate);

    while (tempDate <= lastDate) {
      weekDays.push(tempDate.weekday);
      tempDate = tempDate.plus({ days: 1 });
    }
    const mappedChartData: MoodChartData[] = [];

    shortWeekDays.forEach((day, index) => {
      const match = chartData.find((data) => index === Number(data.label) - 1);
      const data = match?.value ? Number(match.value - 1) : undefined;
      const translatedDay = this.translationService.translate(
        `constant.${day}`,
      );
      mappedChartData.push({ label: translatedDay, value: data });
    });
    return mappedChartData;
  }

  private getMoodChartDataByMonth(
    chartData: MoodChartData[],
    startDate: string,
    endDate: string,
  ): MoodChartData[] {
    const monthDays: string[] = [];
    let tempDate = DateTime.fromISO(startDate);
    const lastDate = DateTime.fromISO(endDate);

    while (tempDate <= lastDate) {
      const day = tempDate.toISODate() as string;
      monthDays.push(day);
      tempDate = tempDate.plus({ days: 1 });
    }
    const mappedChartData: MoodChartData[] = [];

    monthDays.forEach((day) => {
      const date = DateTime.fromISO(day);
      const label = `${date.day}/${date.month}`;

      const match = chartData.find(
        (data) => DateTime.fromJSDate(new Date(data.label)).toISODate() === day,
      );
      const data = match?.value ? Number(match.value) : 0;
      mappedChartData.push({ label: label, value: data });
    });
    return mappedChartData;
  }

  private getMoodChartDataByYear(
    startDate: string,
    endDate: string,
    chartData: MoodChartData[],
  ): MoodChartData[] {
    const mappedChartData: MoodChartData[] = [];
    const months: number[] = [];
    let tempDate = DateTime.fromISO(startDate);
    const lastDate = DateTime.fromISO(endDate);

    while (tempDate <= lastDate) {
      months.push(tempDate.month);
      tempDate = tempDate.plus({ months: 1 });
    }

    months.forEach((month) => {
      const match = chartData.find((data) => month === Number(data.label));
      const label = Info.months('short')[month - 1];
      const value = match?.value ? Number(match.value) : 0;
      mappedChartData.push({ label, value });
    });
    return mappedChartData;
  }

  async getMoodChartByRange(
    userId: string,
    startDate: string,
    endDate: string,
    insightRange: InsightRange,
    toolkitId?: string,
  ): Promise<MoodInsightsChart> {
    if (insightRange === InsightRange.MONTH) {
      const chartData = await this.insightsRepo.getMoodInsightsMonthChart(
        userId,
        startDate,
        endDate,
        toolkitId,
      );
      const isEmpty = !chartData.length ? true : false;
      const mappedChartData = this.getMoodChartDataByMonth(
        chartData,
        startDate,
        endDate,
      );
      return {
        chartData: mappedChartData,
        isEmpty,
      };
    }
    const chartData = await this.insightsRepo.getMoodInsightsChartByInightRange(
      userId,
      startDate,
      endDate,
      insightRange,
      toolkitId,
    );

    const isEmpty = !chartData.length ? true : false;

    if (insightRange === InsightRange.WEEK) {
      const mappedChartData = this.getMoodChartDataByWeek(
        startDate,
        endDate,
        chartData,
      );
      return {
        chartData: mappedChartData,
        isEmpty,
      };
    }

    const mappedChartData = this.getMoodChartDataByYear(
      startDate,
      endDate,
      chartData,
    );
    return {
      chartData: mappedChartData,
      isEmpty,
    };
  }

  async getMostLoggedMoodAverages(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvegrageMood[]> {
    const mostLoggedMoods = await this.insightsRepo.getMostLoggedMoodAverages(
      userId,
      startDate,
      endDate,
    );
    const moodCounts: number[] = [];
    moodRankings.forEach((rank) => {
      const match = mostLoggedMoods.find(
        (data) => rank === Number(data.ranking),
      );
      const count = match ? Number(match.count) : 0;
      moodCounts.push(Number(count));
    });
    const total = moodCounts.reduce((a, b) => a + b, 0);
    const medicationVsMood: AvegrageMood[] = moodCounts.map(
      (moodCount, index) => {
        if (total === 0) {
          return {
            label: index,
            value: `${total}%`,
          };
        }
        const value = Math.round((Number(moodCount) / Number(total)) * 100);
        return {
          label: index,
          value: `${value}%`,
        };
      },
    );
    return medicationVsMood;
  }

  /**
   * @description  we using ISODOW to extract Day of the week which
   * starts as Monday (1) to Sunday (7) to map Mon to Sun data
   * we use Number(data.label) - 1 so that we can map the week day with the data
   */
  async getAverageDailyMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<AvegrageDailyMood> {
    const graphData: DailyMoodBarGraph[] =
      await this.insightsRepo.getAverageDailyMoodGraph(
        userId,
        startDate,
        endDate,
      );
    let bestDayOfWeek: string | undefined;
    if (graphData.length) {
      const bestDayData = graphData.reduce((prev, current) =>
        +prev.value > +current.value ? prev : current,
      );
      const translatedLongWeekDays = longWeekDays.map((day) =>
        this.translationService.translate(`constant.${day}`),
      );
      bestDayOfWeek = translatedLongWeekDays[Number(bestDayData.label) - 1];
    }

    const dailyMoodGraph: AvegrageDailyMoodGraph[] = [];
    shortWeekDays.forEach((day, index) => {
      const match = graphData.find((data) => index === Number(data.label) - 1);
      //mood ranking starts from 1 to 5
      //sending the value from 0 to 4 that's why we added match.value -1
      const data = match?.value ? Number(match.value - 1) : undefined;
      const translatedDay = this.translationService.translate(
        `constant.${day}`,
      );
      dailyMoodGraph.push({ label: translatedDay, value: data });
    });
    return {
      bestDayOfWeek,
      dailyMoodGraph,
    };
  }

  async getAverageActivity(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<AverageActivity> {
    const [{ avg_steps }, { avg_activity }] = await Promise.all([
      this.insightsRepo.getAverageSteps(userId, startDate, endDate),
      this.insightsRepo.getAverageActivityTime(userId, startDate, endDate),
    ]);
    const activityTime =
      avg_activity >= 3600
        ? this.convertMinutesToHoursAndMinutes(Math.floor(avg_activity / 60))
        : this.convertSecondsToMinutesAndSeconds(avg_activity);

    return {
      activityTime: activityTime,
      steps: avg_steps,
    };
  }

  async getStepsVsMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<StepsVsMood> {
    const graphData: StepsVsMoodGraph[] =
      await this.insightsRepo.getStepsVsMoodGraph(userId, startDate, endDate);
    let bestSteps: string | undefined;
    if (graphData.length) {
      const bestStepsData = graphData.map((data) => {
        return data.value ? data.value : 0;
      });
      const max = Math.max(...bestStepsData);
      const formatter = Intl.NumberFormat('en', { notation: 'compact' });
      bestSteps = formatter.format(max);
    }
    const stepsMoodGraph: StepsVsMoodGraph[] = [];

    shortWeekDays.forEach((day, index) => {
      const match = graphData.find((data) => index === Number(data.label) - 1);
      const data = match ? Number(match.value) : 0;
      const translatedDay = this.translationService.translate(
        `constant.${day}`,
      );
      stepsMoodGraph.push({
        label: translatedDay,
        value: data,
        emoji: match?.emoji,
      });
    });
    return {
      bestSteps,
      stepsVsMoodGraph: stepsMoodGraph,
    };
  }

  async getActivityVsMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ActivityVsMood> {
    const graphData: ActivityVsMoodGraph[] =
      await this.insightsRepo.getActivityVsMoodGraph(
        userId,
        startDate,
        endDate,
      );
    let bestHours: string | undefined;
    if (graphData.length) {
      const bestHoursData = graphData.map((data) => {
        return data.value ? data.value : 0;
      });
      const max = Math.max(...bestHoursData);
      bestHours =
        max >= 3600
          ? this.convertMinutesToHoursAndMinutes(Math.floor(max / 60))
          : this.convertSecondsToMinutesAndSeconds(max);
    }
    const activityVsMoodGraph: ActivityVsMoodGraph[] = [];

    shortWeekDays.forEach((day, index) => {
      const match = graphData.find((data) => index === Number(data.label) - 1);
      const data = match ? Number(Math.floor(match.value / 60)) : 0;
      const translatedDay = this.translationService.translate(
        `constant.${day}`,
      );
      activityVsMoodGraph.push({
        label: translatedDay,
        value: data,
        emoji: match?.emoji,
      });
    });
    return {
      bestActivityTime: bestHours,
      activityVsMoodGraph: activityVsMoodGraph,
    };
  }

  async getSleepVsMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<SleepHourVsMood> {
    const graphData: SleepHourVsMoodGraph[] =
      await this.insightsRepo.getSleepVsMoodGraph(userId, startDate, endDate);
    let bestSleepHours: string | undefined;
    if (graphData.length) {
      const bestSleepData = graphData.map((data) => {
        return data.value ? data.value : 0;
      });
      const max = Math.max(...bestSleepData);
      const translatedHour = this.translationService.translate(`constant.hour`);
      bestSleepHours = `${Math.floor(max / 60)}${translatedHour}`;
    }
    const sleepVsMoodGraph: SleepHourVsMoodGraph[] = [];
    shortWeekDays.forEach((day, index) => {
      const match = graphData.find((data) => index === Number(data.label) - 1);
      const data = match ? Number(match.value) : 0;
      const translatedDay = this.translationService.translate(
        `constant.${day}`,
      );
      sleepVsMoodGraph.push({
        label: translatedDay,
        value: data,
        emoji: match?.emoji,
      });
    });
    return {
      bestSleepHours: bestSleepHours,
      sleepHourVsMoodGraph: sleepVsMoodGraph,
    };
  }
  async getAverageDeepAndTotalSleep(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ deepSleep: string; sleepHours: string }> {
    const [{ avg_deep_sleep }, { sleep_time }] = await Promise.all([
      this.insightsRepo.getAverageDeepSleep(userId, startDate, endDate),
      this.insightsRepo.getAverageTotalSleep(userId, startDate, endDate),
    ]);
    const hours = Math.floor(avg_deep_sleep / 60);
    const minutes = Math.round(avg_deep_sleep % 60);
    const deepSleep = `${hours}:${minutes}`;
    const sleepHours = this.convertMinutesToHoursAndMinutes(sleep_time);
    return {
      deepSleep,
      sleepHours,
    };
  }
}
