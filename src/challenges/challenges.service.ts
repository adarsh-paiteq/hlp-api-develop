import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ChallengeStatus,
  GetResultBodyDto,
  GetResultResponseDto,
  TargetType,
  UpdateUserChallenge,
} from './challenges.dto';
import { ChallengesRepo } from './challenges.repo';
import * as datefns from 'date-fns';
import { Schedule } from '../schedules/schedules.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ChallengesEvent,
  ChallengeEndedEvent,
  ChallengeWonEvent,
  ChallengeGoalCompletedEvent,
} from './challenges.event';
import {
  AddChallengeArgs,
  Challenge,
  ChallengeRankingResponse,
  ChallengeResponse,
  GetRankingArgs,
  IsChallengePointsClaimedArgs,
  IsChallengePointsClaimedResponse,
  UpdateChallengeArgs,
  UserRanking,
} from './challenges.model';
import { ChallengesQueue } from './challenges.queue';
import { UtilsService } from '../utils/utils.service';
import { DateTime } from 'luxon';
import { GetChallengeInfoResponse } from './dto/challenge.dto';
import { Toolkit, toolkitAnswerTables } from '../toolkits/toolkits.model';
import {
  GetChallengeResultArgs,
  GetChallengeResultResponse,
} from './dto/get-challenge-result.dto';
import { ChannelsRepo } from '../channels/channels.repo';
import { UserChallenge } from './entities/user-challenge.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Channel } from '@channels/entities/channel.entity';
@Injectable()
export class ChallengesService {
  private readonly logger = new Logger(ChallengesService.name);
  constructor(
    private readonly challengesRepo: ChallengesRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly challengesQueue: ChallengesQueue,
    private readonly utilsService: UtilsService,
    private readonly channelsRepo: ChannelsRepo,
    private readonly translationService: TranslationService,
  ) {}

  private getStartAndEndOfWeek(dateString: string): {
    startDate: Date;
    endDate: Date;
  } {
    const date = new Date(dateString);
    const startDate = datefns.startOfWeek(date);
    const endDate = datefns.endOfWeek(date);
    return {
      startDate,
      endDate,
    };
  }

  private getChallengePoints(
    userId: string,
    rankings: UserRanking[],
  ): { points: number; ranking: number } {
    const userRanking = rankings.find(({ user_id }) => user_id === userId);
    if (!userRanking) {
      return { points: 0, ranking: 0 };
    }
    const { id: ranking, hlp_points_earned: points } = userRanking;
    return { points, ranking };
  }

  private getTarget(
    schedule: Schedule,
    date: string,
  ): Pick<GetResultResponseDto, 'targetTotal' | 'targetType' | 'completed'> {
    const repeatPerDay =
      schedule.repeat_per_day && schedule.repeat_per_day > 1
        ? schedule.repeat_per_day
        : 1;
    const targetType =
      repeatPerDay === 1 ? TargetType.DAILY : TargetType.WEEKLY;
    let scheduleDays = 7;
    if (schedule.schedule_days?.length) {
      scheduleDays = schedule.schedule_days.length;
    }
    const targetTotal =
      targetType === TargetType.DAILY ? repeatPerDay : scheduleDays;
    const completed = schedule.user_schedule_sessions.filter((session) => {
      if (targetType === TargetType.DAILY) {
        return datefns.isSameDay(
          new Date(date),
          new Date(session.session_date),
        );
      }
      return datefns.isSameWeek(new Date(date), new Date(session.session_date));
    }).length;
    return {
      targetTotal,
      targetType,
      completed,
    };
  }
  /**
   * This function is deprecated and should not be used.
   * This code is only included for backward compatibility.
   * Use the @function getUserChallengeResult() function instead.
   * @deprecated
   */
  async getResult(
    id: string,
    body: GetResultBodyDto,
  ): Promise<GetResultResponseDto> {
    const { date, userId } = body;
    const [challenge, challengeRankings, schedule] = await Promise.all([
      this.challengesRepo.getChallengeById(id),
      this.getRanking(
        {
          id,
          date,
        },
        userId,
      ),
      this.challengesRepo.getScheduleWithToolkit(id, body.userId),
    ]);
    const toolKitAnswersTableName = toolkitAnswerTables.get(
      schedule.toolkit.tool_kit_type,
    );
    if (!toolKitAnswersTableName) {
      throw new BadRequestException(`challenges.tool_kit_not_found`);
    }

    const { startDate, endDate } = this.utilsService.getDatesByScheduleType(
      schedule.schedule_type,
      body.date,
    );
    const sessions = await this.challengesRepo.getChallengeSessions(
      toolKitAnswersTableName,
      id,
      body.userId,
      startDate,
      endDate,
    );
    const { points, ranking } = this.getChallengePoints(
      body.userId,
      challengeRankings.user_rankings,
    );
    const { targetTotal, targetType, completed } = this.utilsService.getTarget(
      { ...schedule, user_schedule_sessions: sessions },
      date,
    );
    const defaultChannel = await this.channelsRepo.getDefaultChannel();
    const { toolkit } = schedule;
    const result: GetResultResponseDto = {
      challenge_gif: toolkit.tool_kit_result_screen_image,
      challenge_title: challenge.title,
      level: ranking,
      hlp_points: toolkit.tool_kit_hlp_reward_points,
      total_hlp_points: points,
      ranking,
      targetTotal,
      targetType,
      completed,
      is_completed: challenge.is_challenge_completed,
      default_channel: defaultChannel || null,
    };
    return result;
  }

  async getRanking(
    args: GetRankingArgs,
    userId: string,
    lang?: string,
  ): Promise<ChallengeRankingResponse> {
    const { id, date } = args;
    const challenge = await this.challengesRepo.getChallenge(id);
    if (!challenge) {
      throw new NotFoundException();
    }
    const [translatedTitle] =
      this.translationService.getTranslations<Challenge>(
        [challenge],
        ['title'],
        lang,
      );

    const {
      hlp_reward_points_required_for_completing_goal,
      hlp_reward_points_required_for_winning_challenge,
      is_challenge_completed,
    } = challenge;
    const toolKitAnswersTableName = toolkitAnswerTables.get(
      challenge.tool_kit_type,
    );
    if (!toolKitAnswersTableName) {
      throw new BadRequestException(`challenges.tool_kit_not_found`);
    }
    const users = await this.challengesRepo.getUsersWithPoints(
      toolKitAnswersTableName,
      challenge.id,
    );

    const mappedUsers = users.map((user, index) => {
      return {
        ...user,
        id: index + 1,
        hlp_points_earned: Number(user.hlp_points_earned),
      };
    });

    // challenge claimed status
    const userChallenge = await this.challengesRepo.getUserChallenge(
      userId,
      id,
    );

    const challengePointsClaimed =
      !userChallenge || userChallenge.status === ChallengeStatus.COMPLETED;

    //current user ranking
    let userRanking = 0;
    const userRankingObj = mappedUsers.find((user) => user.user_id === userId);
    if (userRankingObj) {
      userRanking = userRankingObj.id;
    }
    let daysPassed = datefns.differenceInDays(
      new Date(date),
      new Date(challenge.challenge_start_date),
    );

    const totalDays = datefns.differenceInDays(
      new Date(challenge.challenge_end_date),
      new Date(challenge.challenge_start_date),
    );
    daysPassed = daysPassed <= totalDays ? daysPassed : totalDays;

    const challengeEndDate = datefns.format(
      new Date(challenge.challenge_end_date),
      'dd MMMM yyyy',
    );

    const challengeRanking: ChallengeRankingResponse = {
      title: translatedTitle.title,
      hlp_reward_points_required_for_completing_goal,
      hlp_reward_points_required_for_winning_challenge,
      is_challenge_completed,
      challenge_end_date: challengeEndDate,
      total_days: totalDays,
      user_rankings: mappedUsers,
      days_passed: daysPassed,
      challenge_points_claimed: challengePointsClaimed,
      user_ranking: userRanking,
    };

    return challengeRanking;
  }

  getChallengeEndDelay(challengeEndDate: string): number {
    const currentDate = DateTime.fromJSDate(new Date()).toUTC();
    const endDate = DateTime.fromJSDate(new Date(challengeEndDate)).toUTC();
    const { milliseconds } = endDate.diff(currentDate).toObject();
    const delay = !milliseconds || milliseconds <= 0 ? 1000 : milliseconds;
    return delay;
  }

  async addChallenge(
    challengeDetails: AddChallengeArgs,
  ): Promise<ChallengeResponse> {
    const { tool_kit_id } = challengeDetails;
    const challenge = await this.challengesRepo.getActiveChallengeByToolkitId(
      tool_kit_id,
    );
    if (challenge) {
      throw new BadRequestException(`challenges.not_added_challenge_tool_kit`);
    }

    const newChallange = await this.challengesRepo.createChallenge(
      challengeDetails,
    );

    const { id: challengeId, challenge_end_date: endDate } = newChallange;
    const delay = this.getChallengeEndDelay(endDate);
    await this.challengesQueue.endTheChallenge(challengeId, delay);
    return newChallange;
  }

  async updateChallenge(
    challengeId: string,
    updateChallengeArgs: UpdateChallengeArgs,
  ): Promise<ChallengeResponse> {
    const { challenge_end_date: endDate } = updateChallengeArgs;
    const challenge = await this.challengesRepo.getChallengeById(challengeId);
    if (!challenge) {
      throw new NotFoundException(`challenges.challenge_not_found`);
    }
    const updatedChallenge = await this.challengesRepo.updateChallenge(
      challengeId,
      updateChallengeArgs,
    );
    if (endDate) {
      const delay = this.getChallengeEndDelay(endDate);
      //removing old delayed job and adding new delayed job
      this.logger.log(`Updating challenge end job`);
      await this.challengesQueue.removeJobById(challengeId);
      await this.challengesQueue.endTheChallenge(challengeId, delay);
    }
    return updatedChallenge;
  }

  async endTheChallenge(challengeId: string): Promise<string> {
    const challenge = await this.challengesRepo.updateChallengeAsCompleted(
      challengeId,
    );
    if (!challenge) {
      throw new BadRequestException(
        `challenges.failed_update_challenge ${challengeId}`,
      );
    }
    this.eventEmitter.emit(
      ChallengesEvent.CHALLENGE_ENDED,
      new ChallengeEndedEvent(challenge),
    );
    const schedules = await this.challengesRepo.disableChallengeSchedules(
      challengeId,
    );
    this.logger.log(`disabled ${schedules.length} challenge schedules`);
    return `${challenge.id} ${this.translationService.translate(
      'challenges.complete_challenge',
    )}`;
  }

  async isChallengePointsClaimed(
    args: IsChallengePointsClaimedArgs,
    userId: string,
  ): Promise<IsChallengePointsClaimedResponse> {
    const { challengeId } = args;
    const challenge = await this.challengesRepo.getActiveChallengeById(
      challengeId,
    );
    if (challenge) {
      throw new NotFoundException(`challenges.challenge_not_finished`);
    }
    const userChallenge = await this.challengesRepo.getUserChallenge(
      userId,
      challengeId,
    );

    const challengePointsClaimed =
      userChallenge && userChallenge.status !== ChallengeStatus.IN_PROGRESS;
    if (!challengePointsClaimed) {
      await this.challengesQueue.updateUserChallengeStatus(challengeId, userId);
    }
    return {
      challenge_points_claimed: challengePointsClaimed,
    };
  }

  async updateUserChallengeStatus(
    challengeId: string,
    userId: string,
  ): Promise<UserChallenge> {
    const challenge = await this.challengesRepo.getChallenge(challengeId);

    if (!challenge) {
      throw new BadRequestException(`challenges.challenge_not_found`);
    }
    if (!challenge.is_challenge_completed) {
      throw new BadRequestException(`challenges.challenge_not_complete`);
    }
    const {
      hlp_reward_points_required_for_completing_goal:
        requiredPointsToCompleteGoal,
      hlp_reward_points_to_be_awarded_for_completing_goal:
        rewardPointsForCompletingGoal,
      hlp_reward_points_to_be_awarded_for_winning_challenge:
        rewardPointsForWinning,
    } = challenge;

    const toolKitAnswersTableName = toolkitAnswerTables.get(
      challenge.tool_kit_type,
    );
    if (!toolKitAnswersTableName) {
      throw new BadRequestException(`challenges.tool_kit_not_found`);
    }
    const userRankings = await this.challengesRepo.getUsersWithPoints(
      toolKitAnswersTableName,
      challenge.id,
    );

    const { points: userEarnedPoints } = this.getChallengePoints(
      userId,
      userRankings,
    );

    let challengeTotalPoints = 0;
    let highestEarnedPoints = 0;

    for (const userRanking of userRankings) {
      challengeTotalPoints += Number(userRanking.hlp_points_earned);
      highestEarnedPoints = Math.max(
        highestEarnedPoints,
        Number(userRanking.hlp_points_earned),
      );
    }

    const isWinner = Number(userEarnedPoints) >= highestEarnedPoints;
    const isGoalCompleted =
      challengeTotalPoints >= requiredPointsToCompleteGoal;

    const hlp_points_earned_for_completing_goal = isGoalCompleted
      ? Number(rewardPointsForCompletingGoal)
      : 0;

    const hlp_points_earned_for_winning_the_challenge = isWinner
      ? Number(rewardPointsForWinning)
      : 0;

    const status = isWinner
      ? ChallengeStatus.WINNER
      : ChallengeStatus.COMPLETED;

    const total_hlp_reward_points_earned =
      hlp_points_earned_for_completing_goal +
      hlp_points_earned_for_winning_the_challenge +
      Number(userEarnedPoints);

    const updateUserChallenge: UpdateUserChallenge = {
      hlp_points_earned_for_completing_goal,
      hlp_points_earned_for_winning_the_challenge,
      total_hlp_reward_points_earned,
      status,
      total_hlp_points_earned_by_performing_tool_kit: Number(userEarnedPoints),
      is_goal_completed: isGoalCompleted,
      is_winner: isWinner,
    };

    const updatedUserChallenge = await this.challengesRepo.updateUserChallenge(
      challengeId,
      userId,
      updateUserChallenge,
    );
    if (!updatedUserChallenge) {
      throw new BadRequestException(
        `challenges.failed_update_user_status_challenge`,
      );
    }
    const { is_winner, is_goal_completed } = updateUserChallenge;

    if (is_winner) {
      this.eventEmitter.emit(
        ChallengesEvent.WON,
        new ChallengeWonEvent(updatedUserChallenge),
      );
    }

    if (is_goal_completed) {
      this.eventEmitter.emit(
        ChallengesEvent.GOAL_COMPLETED,
        new ChallengeGoalCompletedEvent(updatedUserChallenge),
      );
    }

    return updatedUserChallenge;
  }

  async getChallengeInfo(
    userId: string,
    challengeId: string,
    lang: string,
  ): Promise<GetChallengeInfoResponse> {
    const challengeInfo = await this.challengesRepo.getChallengeInfoById(
      userId,
      challengeId,
    );
    if (!challengeInfo) {
      throw new NotFoundException(`challenges.challenge_info_not_found`);
    }
    this.translationService.getTranslations<Challenge>(
      [challengeInfo],
      ['title', 'label', 'short_description', 'description'],
      lang,
    );

    this.translationService.getTranslations<Toolkit>(
      [challengeInfo.tool_kit],
      ['title', 'short_description'],
      lang,
    );
    return challengeInfo;
  }

  async getUserChallengeResult(
    userId: string,
    body: GetChallengeResultArgs,
    lang?: string,
  ): Promise<GetChallengeResultResponse> {
    const { date, id } = body;
    const [challenge, challengeRankings, schedule] = await Promise.all([
      this.challengesRepo.getChallengeById(id),
      this.getRanking(
        {
          id,
          date,
        },
        userId,
      ),
      this.challengesRepo.getScheduleWithToolkit(id, userId),
    ]);
    const toolKitAnswersTableName = toolkitAnswerTables.get(
      schedule.toolkit.tool_kit_type,
    );
    if (!toolKitAnswersTableName) {
      throw new BadRequestException(`challenges.tool_kit_not_found`);
    }

    const { startDate, endDate } = this.utilsService.getDatesByScheduleType(
      schedule.schedule_type,
      body.date,
    );
    const sessions = await this.challengesRepo.getChallengeSessions(
      toolKitAnswersTableName,
      id,
      userId,
      startDate,
      endDate,
    );
    const { points, ranking } = this.getChallengePoints(
      userId,
      challengeRankings.user_rankings,
    );
    const { targetTotal, targetType, completed } = this.utilsService.getTarget(
      { ...schedule, user_schedule_sessions: sessions },
      date,
    );
    const [translatedChallenge] =
      this.translationService.getTranslations<Challenge>(
        [challenge],
        ['title'],
        lang,
      );
    const defaultChannel = await this.channelsRepo.getDefaultChannel();
    const [translatedDefaultChannel] =
      this.translationService.getTranslations<Channel>(
        [defaultChannel],
        [
          'title',
          'short_description',
          'description',
          'extra_information_title',
          'extra_information_description',
        ],
        lang,
      );
    const { toolkit } = schedule;
    const result: GetChallengeResultResponse = {
      challenge_gif: toolkit.tool_kit_result_screen_image,
      challenge_title: translatedChallenge.title,
      level: ranking,
      hlp_points: toolkit.tool_kit_hlp_reward_points,
      total_hlp_points: points,
      ranking,
      targetTotal,
      targetType,
      completed,
      is_completed: challenge.is_challenge_completed,
      default_channel: translatedDefaultChannel,
    };
    return result;
  }
}
