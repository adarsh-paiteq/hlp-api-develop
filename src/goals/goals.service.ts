import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { Schedule } from '../schedules/schedules.dto';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import {
  GetHistoryQuery,
  GetHistoryResponse,
  GetLevelsResponse,
  Goal,
  GoalHistoryDto,
  GoalLevel,
  GoalToolKit,
  GroupSessionsByDate,
  UserGoalDto,
} from './goals.dto';
import { GoalsEvent, GoalsLevelSavedEvent } from './goals.event';
import {
  GetGoalsByAgeGroupResponse,
  UpdateUserGoalsArgs,
  UpdateUserGoalsResponse,
} from './goals.model';
import { GoalsRepo } from './goals.repo';
import { Goal as GoalEntity } from './entities/goal.entity';
import {
  GetGoalLevelsResponse,
  GoalLevelDto,
  GoalLevelWithStatus,
  SaveUserGoalLevel,
} from './dto/goal-levels.dto';
import { GoalInfo } from './entities/goal-info.entity';
import { GetGoalPointsResponse } from './dto/get-goal-points.dto';
import { toolkitAnswerTables } from '@toolkits/toolkits.model';
import { GetGoalHistoryResponse } from './dto/get-goal-history.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { AddUserGoalsResponse } from './dto/add-user-goals.dto';
import { OnboardingScreen } from '@users/users.model';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetUserGoalHistoryResponse } from './dto/get-user-goal-history.dto';
import { GetGoalCategoriesWithGoalsResponse } from './dto/get-goal-categories-with-goals.dto';

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);

  constructor(
    private readonly goalsRepo: GoalsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}

  /**
   *@deprecated its's migrated to getGoalLevels,it is used in @function getLevels().
   */
  private getEarnedToolkitPoints(toolkits: GoalToolKit[]): number {
    return toolkits.reduce(
      (
        acc,
        {
          user_schedule_sessions_aggregate: { aggregate },
          tool_kit_hlp_reward_points,
        },
      ) => {
        return acc + aggregate.count * tool_kit_hlp_reward_points;
      },
      0,
    );
  }

  /**
   *@deprecated its's migrated to getGoalLevels,it is used in @function getLevels().
   */
  private getMappedGoalLevel(
    totalPoint: number,
    goal_levels: GoalLevel[],
    goal: Goal,
  ): GoalLevel[] {
    const mappedGoalLevel: GoalLevel[] = goal_levels.map((goalLevel) => {
      const is_completed = goalLevel.user_goal_levels.length > 0;
      let progressPercentage =
        (totalPoint / goalLevel.hlp_reward_points_to_complete_goal) * 100;
      progressPercentage =
        progressPercentage > 100 ? 100 : Math.floor(progressPercentage);
      this.logger.log(
        `progress:${progressPercentage},totalPoints:${totalPoint}`,
      );
      return {
        ...goalLevel,
        is_completed,
        progress_percentage: progressPercentage,
        goal_avatar: goal.avatar,
        goal_title: goal.title,
        emoji_image_url: goal.emoji_image_url,
        emoji_image_id: goal.emoji_image_id,
        emoji_image_file_path: goal.emoji_image_file_path,
      };
    });
    return mappedGoalLevel;
  }

  /**
   *@deprecated its's migrated to getGoalLevels
   */
  async getLevels(userId: string): Promise<GetLevelsResponse> {
    const userGoals = await this.goalsRepo.getGoalLevels(userId);

    const goalsWithGoalLevels = userGoals.filter(
      (userGoal) => userGoal.goalByGoal.goal_levels.length,
    );

    const goalsLevels = goalsWithGoalLevels.map((userGoal) => {
      const {
        goalByGoal: { goal_levels, tool_kits },
      } = userGoal;

      const totalPoint = this.getEarnedToolkitPoints(tool_kits);
      const mappedGoalLevel = this.getMappedGoalLevel(
        totalPoint,
        goal_levels,
        userGoal.goalByGoal,
      );
      let goalLevel: GoalLevel | undefined;
      const reverseMappedGoalLevels = mappedGoalLevel.slice().reverse();
      goalLevel = mappedGoalLevel.find((goalLevel) => !goalLevel.is_completed);
      if (!goalLevel) {
        goalLevel = reverseMappedGoalLevels.find(
          (goalLevel) => goalLevel.is_completed,
        );
      }
      return goalLevel;
    });

    this.logger.log(goalsLevels);
    return { data: goalsLevels };
  }

  /**
   *@description its's migrated to getUserGoalHistory resolver but the app-side code is still using the getGoalsHistory action ,It is used for @function getHistory() that are in goals service
   */
  private prepareGoalsHistory(schedules: Schedule[]): GoalHistoryDto[] {
    const history = schedules.map<GoalHistoryDto>((schedule) => {
      const [session] = schedule.user_schedule_sessions;
      const total = schedule.repeat_per_day ? schedule.repeat_per_day : 1;
      const completed = schedule.user_schedule_sessions.length;
      const time = session.created_at as string;
      const title = schedule.toolKitByToolKit
        ? schedule.toolKitByToolKit.title
        : schedule.checkInByCheckIn.title;
      return {
        title,
        date: session.session_date,
        total,
        completed,
        time,
        schedule_id: schedule.id,
      };
    });
    return history;
  }

  /**
   *@description its's migrated to getUserGoalHistory resolver but the app-side code is still using the getGoalsHistory action,It is used for @function getHistory() that are in goals service
   */
  private groupSessionsByDate(
    sessions: ScheduleSessionDto[],
  ): GroupSessionsByDate {
    const sessionsDates = new Set<string>();
    sessions.forEach((session) => sessionsDates.add(session.session_date));
    const groupByDate: GroupSessionsByDate = [];
    sessionsDates.forEach((sessionDate) => {
      const newSessions = sessions.filter(
        (session) => session.session_date === sessionDate,
      );
      groupByDate.push({ date: sessionDate, sessions: newSessions });
    });
    return groupByDate;
  }

  /**
   *@description its's migrated to getUserGoalHistory resolver but the app-side code is still using the getGoalsHistory action,It is used for @function getHistory() that are in goals service
   */
  private groupSessionsBySchedule(sessions: ScheduleSessionDto[]): Schedule[] {
    const scheduleIds = new Set(
      sessions.map((session: ScheduleSessionDto) => session.schedule_id),
    );
    const schedules: Schedule[] = [];
    scheduleIds.forEach((id) => {
      const scheduleSessions = sessions.filter(
        (session: ScheduleSessionDto) => session.schedule_id === id,
      );
      if (scheduleSessions.length) {
        const [scheduleSession] = scheduleSessions;
        const schedule = scheduleSession.schedule as Schedule;
        schedules.push({
          ...schedule,
          user_schedule_sessions: scheduleSessions,
        });
      }
    });
    return schedules;
  }

  /**
   *@description its's migrated to getUserGoalHistory resolver but the app-side code is still using the getGoalsHistory action,It is used for @function getGoalHistory() that are in goals controller
   */
  async getHistory(
    userId: string,
    query: GetHistoryQuery,
  ): Promise<GetHistoryResponse> {
    const userGoals = await this.goalsRepo.getGoalsHistory(userId, query);
    const toolkits = userGoals.flatMap(
      (userGoal) => userGoal.goalByGoal.tool_kits,
    );
    const toolkitsWithHistory = toolkits.filter(
      (toolkit) => toolkit.user_schedule_sessions.length,
    );
    const sessions = toolkitsWithHistory.flatMap(
      (toolkit) => toolkit.user_schedule_sessions,
    );
    const groupedSessions = this.groupSessionsByDate(sessions);
    const data = groupedSessions.flatMap((group) => {
      const schedules = this.groupSessionsBySchedule(group.sessions);
      return schedules;
    });
    const history = this.prepareGoalsHistory(data);
    return {
      history: history,
    };
  }

  getUnlockedGoalLevel(
    goalLevels: GoalLevelWithStatus[],
    earnedPoints: number,
  ): GoalLevelWithStatus | undefined {
    const currentGoalLevel = goalLevels.find(
      (level) => level.is_completed === false,
    );
    if (!currentGoalLevel) {
      return;
    }
    const totalPoints = goalLevels
      .filter((level) => level.is_completed)
      .reduce(
        (a, goalLevel) => a + goalLevel.hlp_reward_points_to_complete_goal,
        0,
      );
    const { hlp_reward_points_to_complete_goal } = currentGoalLevel;
    const requiredPoints = totalPoints + hlp_reward_points_to_complete_goal;
    this.logger.log(
      `Earned Points: ${earnedPoints}, Required Points: ${requiredPoints}`,
    );
    if (earnedPoints >= requiredPoints) {
      return currentGoalLevel;
    }
  }

  /**
   * @description its's used for testing Purpose , this @function checkGoalLevel() used in goals controller.
   */
  async checkGoalLevel(toolkitId: string, userId: string): Promise<string> {
    const goal = await this.goalsRepo.getGoalByToolkiId(toolkitId);
    if (!goal) {
      throw new NotFoundException(
        `${this.translationService.translate(
          'goals.goal_not_found_for_toolkit',
        )}, ${toolkitId}`,
      );
    }
    const { id: goalId } = goal;
    const [{ points: earnedPoints }, goalLevels] = await Promise.all([
      this.getGoalPoint(goalId, userId),
      this.goalsRepo.getUserGoalLevelsWithStatus(userId, goalId),
    ]);

    if (!goalLevels.length) {
      return this.translationService.translate(
        `goals.user_goal_levels_not_found`,
      );
    }

    const unlockedGoalLevel = this.getUnlockedGoalLevel(
      goalLevels,
      earnedPoints,
    );

    if (unlockedGoalLevel) {
      const saveGoalLevel: SaveUserGoalLevel = {
        user_id: userId,
        goal_level_id: unlockedGoalLevel.id,
      };
      const userGoalLevel = await this.goalsRepo.saveUserGoalLevel(
        saveGoalLevel,
      );
      this.eventEmitter.emit(
        GoalsEvent.GOAL_LEVEL_SAVED,
        new GoalsLevelSavedEvent(userGoalLevel),
      );
      return `${unlockedGoalLevel.id}:${
        unlockedGoalLevel.title
      } ${this.translationService.translate('goals.level_unlocked')}`;
    }
    return this.translationService.translate(`goals.no_goal_level_unlocked`);
  }

  async updateUserGoals(
    user: LoggedInUser,
    args: UpdateUserGoalsArgs,
  ): Promise<UpdateUserGoalsResponse> {
    const goals = await this.goalsRepo.getGoals();
    const allGoalIds = goals.map((goal) => goal.id);
    const { goals: selectedGoals } = args;
    const invalidGoals = selectedGoals.filter(
      (goal) => !allGoalIds.includes(goal),
    );
    if (invalidGoals.length) {
      throw new NotFoundException(
        `${invalidGoals.join('')}${this.translationService.translate(
          'goals.goal_not_found',
        )}`,
      );
    }
    const userGoals = selectedGoals.map((goal) => {
      const userGoal: UserGoalDto = {
        user_id: user.id,
        goal: goal,
        is_selected: true,
      };
      return userGoal;
    });
    // promise execution sequence imp!
    await this.goalsRepo.deleteUserGoals(user.id);

    if (userGoals.length) {
      await this.goalsRepo.addUserGoals(userGoals);
    }

    return {
      affectedRows: selectedGoals.length,
    };
  }

  async getGoalsByAgeGroup(
    userId: string,
    organizationId?: string,
  ): Promise<GetGoalsByAgeGroupResponse> {
    const user = await this.goalsRepo.getUser(userId);
    if (!organizationId) {
      throw new NotFoundException(`goals.organisation_not_found`);
    }

    if (!user || !user.age_group) {
      throw new NotFoundException(`goals.user_or_age_group_not_found`);
    }
    const goals = await this.goalsRepo.getGoalsByAgeGroup(
      userId,
      user.age_group,
      organizationId,
    );
    return {
      goals,
    };
  }

  async getGoalLevels(
    userId: string,
    limit?: number,
    lang?: string,
  ): Promise<GetGoalLevelsResponse> {
    const goals = await this.goalsRepo.getGoalsWithLevels(userId, limit);
    const levels = goals
      .flatMap((goal) => {
        const total = Number(goal.total);
        const sortedGoalLevels = goal.goal_levels.sort(
          (b, a) => b.sequence_number - a.sequence_number,
        );
        const mappedGoalLevel = this.mappedGoalLevels(
          total,
          sortedGoalLevels,
          goal,
          lang,
        );
        const goalLevel = mappedGoalLevel.find(
          (goalLevel) => !goalLevel.is_completed,
        );
        if (goalLevel) {
          return goalLevel;
        }
        if (!goalLevel) {
          return mappedGoalLevel.pop();
        }
      })
      .filter((level) => level != undefined);
    return { levels };
  }

  private mappedGoalLevels(
    totalPoint: number,
    goal_levels: GoalLevelWithStatus[],
    goal: GoalEntity,
    lang?: string,
  ): GoalLevelDto[] {
    const [translatedGoal] =
      this.translationService.getTranslations<GoalEntity>(
        [goal],
        ['title'],
        lang,
      );
    const mappedGoalLevel: GoalLevelDto[] = goal_levels.map((goalLevel) => {
      let progressPercentage =
        (totalPoint / goalLevel.hlp_reward_points_to_complete_goal) * 100;
      progressPercentage =
        progressPercentage > 100 ? 100 : Math.floor(progressPercentage);
      //   this.logger.log(
      //     `progress:${progressPercentage},totalPoints:${totalPoint}`,
      //   );
      const [translatedGoalLevel] =
        this.translationService.getTranslations<GoalLevelWithStatus>(
          [goalLevel],
          ['title', 'short_description'],
          lang,
        );
      return {
        ...translatedGoalLevel,
        is_completed: goalLevel.is_completed,
        progress_percentage: progressPercentage,
        goal_title: translatedGoal.title,
        goal_emoji_image_url: goal.emoji_image_url,
        goal_emoji_image_id: goal.emoji_image_id,
        goal_emoji_image_file_path: goal.emoji_image_file_path,
        goal_earned_points: totalPoint,
      };
    });
    return mappedGoalLevel;
  }
  async getGoalInfo(lang: string): Promise<GoalInfo> {
    const goalsInfo = await this.goalsRepo.getGoalInfo();
    if (!goalsInfo) {
      throw new NotFoundException(`goals.goals_info_not_found`);
    }
    const [translatedGoalsInfo] =
      this.translationService.getTranslations<GoalInfo>(
        [goalsInfo],
        ['title', 'description'],
        lang,
      );
    return translatedGoalsInfo;
  }

  /**
   * @description its's used for testing Purpose, this @function checkGoalLevel() used in goals service,
    and @function getPoints() are used in goals controller thar are used for job event.
   */
  async getGoalPoint(
    id: string,
    userId: string,
  ): Promise<GetGoalPointsResponse> {
    const [user, goal] = await Promise.all([
      this.goalsRepo.getUser(userId),
      this.goalsRepo.getGoalById(id),
    ]);
    if (!user) {
      throw new NotFoundException(`goals.user_not_found`);
    }
    if (!goal) {
      throw new NotFoundException(`goals.goal_not_found`);
    }
    const toolkits = await this.goalsRepo.getToolkitsByGoal(id);
    const toolkitAnswerTableNames: string[] = [];
    const excludedTableNames = [
      'habit_tool_kit_answers',
      'habit_tool_kit_tools_answers',
    ]; // hlp_earned_points column doesn't exists in these tables
    toolkits.forEach((toolkit) => {
      const tableName = toolkitAnswerTables.get(toolkit.tool_kit_type);
      if (tableName && !excludedTableNames.includes(tableName)) {
        toolkitAnswerTableNames.push(tableName);
      }
    });
    const points = await this.goalsRepo.getTotalEarnedPointByGoal(
      userId,
      toolkitAnswerTableNames,
    );
    return {
      points,
    };
  }

  async getUserGoalHistory(
    userId: string,
    args: PaginationArgs,
  ): Promise<GetGoalHistoryResponse> {
    const { page, limit } = args;
    const { goalHistory, total } = await this.goalsRepo.getGoalHistory(
      page,
      limit,
      userId,
    );
    const hasMore = args.page * args.limit < total;
    return { goalHistory, hasMore: hasMore };
  }

  async addUserGoals(
    userId: string,
    goalIds: string[],
  ): Promise<AddUserGoalsResponse> {
    goalIds = [...new Set(goalIds)];
    const count = await this.goalsRepo.getGoalsCount(goalIds);

    if (goalIds.length !== count) {
      throw new NotFoundException(`goals.invalid_goal_selected`);
    }

    const inserUserGoalInput = goalIds.map((goalId) => {
      const userGoal: UserGoalDto = {
        user_id: userId,
        goal: goalId,
        is_selected: true,
      };
      return userGoal;
    });
    // promise execution sequence imp!
    await this.goalsRepo.deleteUserGoals(userId);

    if (inserUserGoalInput.length) {
      await this.goalsRepo.addUserGoals(inserUserGoalInput);
    }
    await this.goalsRepo.updateOnboardingScreen(
      userId,
      OnboardingScreen.email_verification,
    );

    return {
      message: `${this.translationService.translate(
        'goals.goals_added_successfully',
      )}`,
    };
  }

  async getGoalHistory(
    userId: string,
    args: PaginationArgs,
  ): Promise<GetUserGoalHistoryResponse> {
    const { page, limit } = args;
    const { goalHistory, total } = await this.goalsRepo.getGoalHistory(
      page,
      limit,
      userId,
    );
    const totalPages = Math.ceil(total / limit);
    return { goalHistory, total, totalPages, page, limit };
  }

  async getGoalCategoriesWithGoals(
    userId: string,
    organizationId?: string,
    lang?: string,
  ): Promise<GetGoalCategoriesWithGoalsResponse> {
    const user = await this.goalsRepo.getUser(userId);
    if (!organizationId) {
      throw new NotFoundException(`goals.organisation_not_found`);
    }

    if (!user || !user.age_group) {
      throw new NotFoundException(`goals.user_or_age_group_not_found`);
    }
    const goalCategoriesWithGoals =
      await this.goalsRepo.getGoalCategoriesWithGoals(
        userId,
        user.age_group,
        organizationId,
        lang,
      );
    return { goalCategoriesWithGoals };
  }

  async addDefaultUserGoal(userId: string): Promise<string> {
    const goals = await this.goalsRepo.getDefaultGoals();
    if (!goals || !goals.length) {
      throw new NotFoundException(`goals.goal_not_found`);
    }

    const userGoals: UserGoalDto[] = goals.map((goal) => ({
      user_id: userId,
      goal: goal.id,
      is_selected: true,
    }));

    if (userGoals.length) {
      await this.goalsRepo.addUserGoals(userGoals);
    }
    return `Goals added successfully for user ${userId}`;
  }
}
