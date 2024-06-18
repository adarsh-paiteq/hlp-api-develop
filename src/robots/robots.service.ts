import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import { toolkitBaseDeepLinks } from '../notifications/notifications.model';
import { NotificationsRepo } from '../notifications/notifications.repo';
import { Schedule } from '../schedules/schedules.model';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import {
  EmailsEvent,
  InactivityRefresherEmailEvent,
} from '../emails/emails.event';
import { UserRobotLogQueue } from '../user-robot-logs/user-robot-logs.queue';
import { UserSessionLogQueue } from '../user-session-logs/user-session-log.queue';
import {
  GetRobotsResponseDto,
  ReminderScheduleToolkit,
  Robot,
  UserScheduleWithToolkit,
  robotButtonsThatRequireDataForDeepLink,
  robotButtonsThatRequireUserIdForDeeplink,
  robotNavigationDeepLinks,
} from './dto/robots.dto';
import {
  ButtonPage,
  DailyRobots,
  RobotButton,
  RobotButtonAction,
  RobotPageType,
  RobotTitleType,
  RobotType,
} from './entities/robot.entity';
import { RobotsHelper } from './robot.helper';
import { RobotsRepo } from './robots.repo';
import { RobotBodyPlaceholder } from './enums/robot-body-placeholder.enum';
import { ServiceCompany } from '../service-offers/entities/service-company.entity';
import {
  AddFlowChartRobotResponse,
  FlowChartRobotInput,
} from './dto/add-flow-chart-robot.dto';
import {
  UpdateFlowChartRobotInput,
  UpdateFlowChartRobotResponse,
} from './dto/update-flow-chrat-robot.dto';
import { DeleteFlowChartResponse } from './dto/delete-flow-chart-robot';
import {
  GetFlowChartRobotArgs,
  GetFlowChartRobotResponse,
} from './dto/get-flow-chart-robot.dto';
import { UserRobotLogDto } from '../user-robot-logs/dto/user-robot-log.dto';
import { AddFlowChartRobotLogResponse } from './dto/add-flow-chart-robot-log.dto';
import {
  FlowChartRobot,
  FlowChartRobotButton,
} from './entities/flow-chart-robot.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { getISODate, getUTCDate } from '../utils/util';
import { RedisService } from '@core/modules/redis/redis.service';
import { UpdateTreatmentTimelineRobotStatusResponse } from './dto/update-treatment-timeline-robot-status.dto';

@Injectable()
export class RobotsService {
  private readonly logger = new Logger(RobotsService.name);
  private date: string;
  constructor(
    private readonly robotsRepo: RobotsRepo,
    private readonly robotsHelper: RobotsHelper,
    private readonly userRobotLogsQueue: UserRobotLogQueue,
    private readonly userSessionLogsQueue: UserSessionLogQueue,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationsRepo: NotificationsRepo,
    private readonly translationService: TranslationService,
    private readonly redisService: RedisService,
  ) {}

  private async addRobotLog(
    robot: DailyRobots,
    userId: string,
    date: string,
    session_log_id?: string,
    page?: RobotPageType,
  ): Promise<void> {
    await this.userRobotLogsQueue.addLog({
      user_id: userId,
      robot_type: robot.type,
      robot_id: robot.id,
      session_log_id,
      date,
      page,
    });
  }

  private async addGreetingText(
    userId: string,
    robots: Robot[],
    date: string,
  ): Promise<Robot[]> {
    const user = await this.robotsHelper.getUser(userId);
    const greeting = this.robotsHelper.getGreetingMessage(date);
    const greetingRobotIndexes: number[] = [];
    robots.forEach((robot, index) => {
      if (robot.title_type === RobotTitleType.greeting) {
        greetingRobotIndexes.push(index);
      }
    });
    greetingRobotIndexes.forEach((index) => {
      if (robots[index]) {
        robots[index].title = `${greeting} ${user.full_name}`;
      }
    });
    return robots;
  }

  private async getOnboardingRobots(
    userId: string,
    date: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const robots = await this.robotsRepo.getOnboardingRobots(page);
    if (!robots.length) {
      this.logger.log(`No onboarding robots`);
      return [];
    }
    const robotsWithGreeting = await this.addGreetingText(userId, robots, date);
    return this.getMappedRobots(robotsWithGreeting, userId, lang);
  }

  private async getWelcomebackRobot(
    userId: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const [robots, user] = await Promise.all([
      this.robotsRepo.getDailyRobots(page),
      this.robotsHelper.getUser(userId),
    ]);
    const welcomeBackRobot = robots.find(
      (robot) => robot.type === RobotType.WELCOME_BACK,
    );
    if (!welcomeBackRobot) {
      return [];
    }
    welcomeBackRobot.title = `${welcomeBackRobot.title} ${user.full_name}!`;
    return this.getMappedRobots([welcomeBackRobot], userId, lang);
  }

  private async getGreetingRobot(
    userId: string,
    date: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const robots = await this.robotsRepo.getDailyRobots(page);
    const robotsWithGreeting = await this.addGreetingText(userId, robots, date);
    const greetingRobot = robotsWithGreeting.find(
      (robot) => robot.title_type === RobotTitleType.greeting,
    );
    if (!greetingRobot) {
      this.logger.log(`No greeting robot`);
      return [];
    }
    return await this.getMappedRobots([greetingRobot], userId, lang);
  }

  getClosedTreatmentTimelineRobotLogKey(userId: string): string {
    return `closed_treatment_timeline_robot_log#${userId}`;
  }

  getClosedTreatmentTimelineRobotLogExpiration(): number {
    const endOfDay = DateTime.local().endOf('day');
    return Math.floor(endOfDay.diffNow('seconds').seconds);
  }

  async addClosedTreatmentTimelineRobotLog(
    userId: string,
    notificationId: string,
  ): Promise<number> {
    const key = this.getClosedTreatmentTimelineRobotLogKey(userId);
    const expiration = this.getClosedTreatmentTimelineRobotLogExpiration();
    await this.redisService.setEx(key, notificationId, expiration);
    return expiration;
  }

  async removeClosedTreatmentTimelineRobotLog(userId: string): Promise<void> {
    const key = this.getClosedTreatmentTimelineRobotLogKey(userId);
    await this.redisService.del(key);
  }

  async getClosedTreatmentTimelineRobotLog(
    userId: string,
  ): Promise<string | null> {
    const key = this.getClosedTreatmentTimelineRobotLogKey(userId);
    const data = await this.redisService.get(key);
    return data;
  }

  private async getTreatmentTimelineNotificationRobot(
    userId: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const userNotification =
      await this.robotsRepo.getUnreadTreatmentTimelineRobotNotification(userId);

    if (!userNotification) {
      this.logger.log(`Treatment Timeline Notification not available`);
      return [];
    }

    const closedNotificationId = await this.getClosedTreatmentTimelineRobotLog(
      userId,
    );

    if (closedNotificationId && userNotification.id === closedNotificationId) {
      this.logger.log(`Treatment Timeline Robot already closed by user`);
      return [];
    }

    if (closedNotificationId && userNotification.id !== closedNotificationId) {
      await this.removeClosedTreatmentTimelineRobotLog(userId);
    }

    //account_id is a doctor_id who added item into treatment timeline
    if (!userNotification.account_id) {
      this.logger.log(
        `Treatment Timeline Notification account_id not available`,
      );
      return [];
    }

    const dailyRobots: Robot[] = await this.robotsRepo.getDailyRobots(page);
    if (!dailyRobots.length) {
      this.logger.log(`No Daily robots`);
      return [];
    }

    const [treatmentTimelineRobot] = dailyRobots.filter(
      (robot) => robot.type === RobotType.TREATMENT_TIMELINE,
    );

    if (!treatmentTimelineRobot) {
      this.logger.log(`treatment timeline notification Robot not availble`);
      return [];
    }

    const user = await this.robotsRepo.getUserById(userNotification.account_id);

    const doctorName = `Dr.${user.first_name} ${user.last_name}`;

    const [mappedRobot] = await this.getMappedRobots(
      [treatmentTimelineRobot],
      userId,
      lang,
    );

    const mappedTreatmentTimelineRobot = mappedRobot as Robot;
    mappedTreatmentTimelineRobot.body =
      mappedTreatmentTimelineRobot.body.replace(
        RobotBodyPlaceholder.DOCTOR_NAME,
        doctorName,
      );
    mappedTreatmentTimelineRobot.notification_id = userNotification.id;
    return [mappedTreatmentTimelineRobot];
  }

  async getRobots(
    userId: string,
    date: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<GetRobotsResponseDto> {
    this.date = date;
    const userSession = await this.robotsHelper.getUserSessionLog(
      userId,
      date,
      page,
    );

    /**
     * first time in a day robot
     */
    if (!userSession) {
      const greetingRobotLog = await this.robotsRepo.getRobotLog(
        userId,
        date,
        RobotType.GREETING,
      );

      if (!greetingRobotLog) {
        const sendRefresherEmail = true;
        const firstTimeInADayRobot = await this.getFirstTimeInADayRobot(
          userId,
          date,
          sendRefresherEmail,
          page,
          lang,
        );

        if (firstTimeInADayRobot.length) {
          const [robot] = firstTimeInADayRobot;
          await this.addRobotLog(robot, userId, date, undefined, page);
          await this.userSessionLogsQueue.addLog(userId, date, page);
          this.logger.log(`First time in a day robot`);
          return {
            robots: firstTimeInADayRobot,
          };
        }
      }
    }

    /**
     * Treatment Timeline notification robot.
     */
    const treatmentTimelineRobot =
      await this.getTreatmentTimelineNotificationRobot(userId, page, lang);

    if (treatmentTimelineRobot.length) {
      this.logger.log(`show treatment timeline robot`);
      return {
        robots: treatmentTimelineRobot,
      };
    }

    /**
     * log robot
     */
    const logMustbeDoneRobot = await this.getLogMustBeDoneRobot(
      userId,
      date,
      page,
      lang,
    );
    if (logMustbeDoneRobot.length) {
      this.logger.log(`Log must be done robot`);
      return {
        robots: logMustbeDoneRobot,
      };
    }

    /**
     * empty and reminder robot
     */
    const utcDate = getUTCDate(new Date(date));
    const [toolReminderRobot, emptyAgendaRobot] = await Promise.all([
      this.getToolkitReminderRobot(userId, utcDate, page, lang),
      this.getEmptyAgendaRobot(userId, date, page, lang),
    ]);
    if (toolReminderRobot.length || emptyAgendaRobot.length) {
      return {
        robots: [...toolReminderRobot, ...emptyAgendaRobot],
      };
    }

    /**
     * tip of day robot
     */
    const tipOfTheDayRobot = await this.getTopTipOfTheDayRobot(
      userId,
      date,
      page,
    );
    if (tipOfTheDayRobot.length) {
      const [robot] = tipOfTheDayRobot;
      await this.addRobotLog(robot, userId, date, userSession?.id, page);
      return {
        robots: tipOfTheDayRobot,
      };
    }

    /**
     * flow chart
     */
    const flowChartRobots = await this.getFlowChartRobots(userId);
    if (flowChartRobots.length) {
      return {
        robots: flowChartRobots,
      };
    }

    /**
     * have a nice day
     */
    const haveNiceDayRobot = await this.getHaveNiceDayRobot(userId, lang);
    return {
      robots: haveNiceDayRobot,
    };
  }

  /**
   * @param sendRefresherEmail this indicates whether to send refresher email or not
   */
  async getFirstTimeInADayRobot(
    userId: string,
    date: string,
    sendRefresherEmail = true,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const onboardingRobotLog = await this.robotsHelper.getOnboardingRobotLog(
      userId,
      page,
    );
    if (!onboardingRobotLog) {
      this.logger.log('show onboarding robots');
      return this.getOnboardingRobots(userId, date, page, lang);
    }
    const lastUserSessionLog = await this.robotsRepo.getLastUserSessionLog(
      userId,
    );
    if (!lastUserSessionLog) {
      this.logger.warn(`No last session log`);
      return [];
    }
    const duration = this.robotsHelper.getDuration(
      lastUserSessionLog.date,
      date,
    );
    this.logger.log(`Last active in ${duration}`);
    if (duration >= 30) {
      this.logger.log(`send welcomeback robot`);
      if (sendRefresherEmail) {
        this.eventEmitter.emit(
          EmailsEvent.INACTIVITY_REFRESHER_EMAIL,
          new InactivityRefresherEmailEvent(userId),
        );
      }
      return this.getWelcomebackRobot(userId, page, lang);
    }
    this.logger.log('Get greeting robot');
    return this.getGreetingRobot(userId, date, page);
  }

  private parseToolKitDeeplinks(
    toolkit: Toolkit,
    baseDeepLink: string,
  ): string {
    const { id: toolkitId, tool_kit_category, tool_kit_type } = toolkit;
    return baseDeepLink
      .replace('TOOLKIT_CATEGORY', tool_kit_category)
      .replace('TOOLKIT_ID', toolkitId)
      .replace('TOOLKIT_TYPE', tool_kit_type);
  }

  private parseServiceDetailsDeeplinks(
    serviceCompany: ServiceCompany,
    baseDeepLink: string,
    service_id: string,
  ): string {
    const { company_name, company_bio } = serviceCompany;
    return baseDeepLink
      .replace('COMPANY_NAME', company_name)
      .replace('SERVICE_ID', service_id)
      .replace('SERVICE_COMPANY_INFO', company_bio);
  }

  private async getToolkitButtonDeeplink(
    tool_kit_id: string | undefined,
    baseDeepLink: string,
  ): Promise<string> {
    if (!tool_kit_id) {
      throw new NotFoundException(`robots.tool_kit_id_not_found_in_robot_data`);
    }
    const toolkit = await this.robotsHelper.getToolkit(tool_kit_id);
    if (!toolkit) {
      throw new NotFoundException(`robots.toolkit_not_found`);
    }
    const deepLink = this.parseToolKitDeeplinks(toolkit, baseDeepLink);
    this.logger.debug(deepLink);
    return deepLink;
  }

  private async getServiceDetailsButtonDeeplink(
    service_id: string | undefined,
    baseDeepLink: string,
  ): Promise<string> {
    if (!service_id) {
      throw new NotFoundException(`robots.service_id_not_found_in_robot_data`);
    }
    const serviceCompany = await this.robotsRepo.getServiceCompanyByServiceId(
      service_id,
    );
    if (!serviceCompany) {
      throw new NotFoundException(`robots.toolkit_not_found`);
    }
    return this.parseServiceDetailsDeeplinks(
      serviceCompany,
      baseDeepLink,
      service_id,
    );
  }

  async getMappedDeepLinkByButton(
    baseDeepLink: string,
    button: RobotButton,
  ): Promise<string> {
    const { page, offer_id, tool_kit_id, service_id, challenge_id } = button;

    if (!page) {
      throw new NotFoundException(`robots.button_page_not_found_in_robot_data`);
    }

    if (page === ButtonPage.TOOL_KIT) {
      return this.getToolkitButtonDeeplink(tool_kit_id, baseDeepLink);
    }

    if (page === ButtonPage.SERVICE_DETAIL) {
      return this.getServiceDetailsButtonDeeplink(service_id, baseDeepLink);
    }

    if (page === ButtonPage.CHALLENGE) {
      if (!challenge_id) {
        throw new NotFoundException(
          `robots.challenge_id_not_found_in_robot_data`,
        );
      }
      return baseDeepLink.replace('CHALLENGE_ID', challenge_id);
    }

    if (page === ButtonPage.OFFER_DETAIL) {
      if (!offer_id) {
        throw new NotFoundException(`robots.offer_id_not_found_in_robot_data`);
      }
      return baseDeepLink.replace('OFFER_ID', offer_id);
    }

    return baseDeepLink;
  }

  async getPageByButtonPageType(
    button: RobotButton,
    userId: string,
  ): Promise<string> {
    if (!button.page) {
      throw new NotFoundException(`robots.button_page_not_found`);
    }
    const baseDeepLink = robotNavigationDeepLinks.get(
      button.page as ButtonPage,
    );
    if (!baseDeepLink) {
      throw new NotFoundException(
        `${this.translationService.translate('robots.button')} ${
          button.page
        } ${this.translationService.translate('robots.deep_link_not_found')}`,
      );
    }
    const isNoDataRequired = !robotButtonsThatRequireDataForDeepLink.includes(
      button.page as ButtonPage,
    );

    if (isNoDataRequired) {
      return baseDeepLink;
    }

    const isRequiredUserId = robotButtonsThatRequireUserIdForDeeplink.includes(
      button.page as ButtonPage,
    );

    if (isRequiredUserId) {
      return baseDeepLink.replace('USER_ID', userId);
    }

    const mappedDeepLink = await this.getMappedDeepLinkByButton(
      baseDeepLink,
      button,
    );
    return mappedDeepLink;
  }

  async mapRobotButtonsWithTranslations(
    robot: DailyRobots,
    userId: string,
    lang?: string,
  ): Promise<RobotButton[]> {
    const mappedRobotButtons = await Promise.all(
      robot.buttons.map(async (button) => {
        const [translatedButton] =
          this.translationService.getTranslations<RobotButton>(
            [button],
            ['label'],
            lang,
          );

        let page = undefined;

        if (button.action === RobotButtonAction.navigate) {
          page = await this.getPageByButtonPageType(button, userId);
        }

        const mappedRobotButton: RobotButton | FlowChartRobotButton = {
          ...button,
          label: translatedButton.label,
          page,
        };
        return mappedRobotButton;
      }),
    );
    return mappedRobotButtons;
  }

  private async addDeepLinksAndToolkitWithRobotTranslations(
    robots: DailyRobots[],
    userId: string,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const mappedRobots = await Promise.all(
      robots.map(async (robot) => {
        const [translatedRobot] =
          this.translationService.getTranslations<DailyRobots>(
            [robot],
            ['title', 'body'],
            lang,
          );

        const suggestedToolkit = await this.getSuggestedToolkit(robot);
        const mappedButtons = await this.mapRobotButtonsWithTranslations(
          robot,
          userId,
          lang,
        );

        return {
          ...robot,
          title: translatedRobot.title,
          body: translatedRobot.body,
          buttons: mappedButtons,
          toolkit: suggestedToolkit,
        };
      }),
    );
    return mappedRobots;
  }

  private async getEmptyAgendaRobot(
    userId: string,
    dateString: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const date = DateTime.fromISO(dateString).startOf('day');
    const dayOfMonth = date.day;
    const weekDay = date.toFormat('EEE');
    const isAgendaNotEmpty = await this.robotsRepo.isAgendaEmpty(
      userId,
      date.toISODate() as string,
      weekDay,
      dayOfMonth,
    );

    if (isAgendaNotEmpty) {
      this.logger.log(`Agenda is not empty`);
      return [];
    }
    const dailyRobots = await this.robotsRepo.getDailyRobots(page);
    if (!dailyRobots.length) {
      this.logger.log(`No Daily robots`);
      return [];
    }
    const agendaRobots = dailyRobots.filter(
      (robot) =>
        robot.type === RobotType.EMPTY_AGENDA ||
        robot.type === RobotType.EMPTY_TOOLKIT,
    );
    if (!agendaRobots.length) {
      this.logger.log(`No Empty Agenda or Empty Toolkit Robot`);
      return [];
    }
    const random =
      agendaRobots[Math.floor(Math.random() * agendaRobots.length)];
    if (random.type === RobotType.EMPTY_TOOLKIT) {
      const { goal: goal } = await this.robotsRepo.getTookitAndGoalByUserId(
        userId,
      );
      this.logger.log(goal);
      const goalTitle = goal.title as string;
      random.body = random.body.replace(
        RobotBodyPlaceholder.GOAL_TITLE,
        goalTitle,
      );
    }
    return this.getMappedRobots([random], userId, lang);
  }

  private async getScheduleToolkitDeeplink(
    schedule: Schedule,
    toolkit: Toolkit,
  ): Promise<string> {
    const { id: scheduleId, user: userId } = schedule;
    const {
      id: toolkitId,
      goal_id,
      title,
      tool_kit_category,
      tool_kit_type,
    } = toolkit;

    const [challenge, userGoal, session] = await Promise.all([
      this.notificationsRepo.getActiveChallengeByToolkit(toolkitId, userId),
      this.notificationsRepo.getUserGoalsByGoalId(goal_id, userId),
      this.notificationsRepo.getSessionDateByScheduleId(scheduleId, userId),
    ]);

    let challengeId,
      goalId,
      isUserJoinedChallenge,
      sessionDate = getISODate(new Date(this.date));
    if (challenge) {
      challengeId = challenge.id;
      isUserJoinedChallenge = challenge.is_user_joined_challenge;
    }
    if (userGoal) {
      goalId = userGoal.goal;
    }
    if (session) {
      sessionDate = getISODate(new Date(session.session_date));
    }
    const basePage = toolkitBaseDeepLinks.get(tool_kit_type as ToolkitType);

    if (!basePage) {
      throw new NotFoundException(`robots.base_deep_link_not_found`);
    }
    let page = basePage
      .replace('replaceToolkitId', toolkitId)
      .replace('replaceCategoryId', tool_kit_category)
      .replace('replaceScheduleId', scheduleId)
      .replace('replaceSessionDate', sessionDate)
      .replace('replaceTitle', title);

    if (challengeId) {
      page = page.concat(`&challengeId=${challengeId}`);
    }
    if (goalId) {
      page = page.concat(`&goalId=${goalId}`);
    }
    if (isUserJoinedChallenge) {
      page = page.replace('from=plan', 'from=challenge');
    }
    return page;
  }

  private async getMappedScheduleToolkitRobot(
    robot: Robot,
    userScheduleWithToolkit: UserScheduleWithToolkit | ReminderScheduleToolkit,
    robotBodyPlaceholder: RobotBodyPlaceholder,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const { schedule, toolkit } = userScheduleWithToolkit;

    const [translatedRobot] =
      this.translationService.getTranslations<DailyRobots>(
        [robot],
        ['title', 'body'],
        lang,
      );
    robot.title = translatedRobot.title;
    robot.body = translatedRobot.body;

    const [translatedToolkit] =
      this.translationService.getTranslations<Toolkit>(
        [toolkit],
        ['title'],
        lang,
      );

    robot.body = robot.body.replace(
      robotBodyPlaceholder,
      translatedToolkit.title,
    );
    const suggestedToolkit = await this.getSuggestedToolkit(robot);

    robot.buttons = await Promise.all(
      robot.buttons.map(async (button) => {
        let page = undefined;
        const [translatedButton] =
          this.translationService.getTranslations<RobotButton>(
            [button],
            ['label'],
            lang,
          );
        if (button.action === RobotButtonAction.navigate) {
          page = await this.getScheduleToolkitDeeplink(
            schedule,
            translatedToolkit,
          );
        }
        return {
          ...button,
          page,
          label: translatedButton.label,
        };
      }),
    );

    const mappedRobot = { ...robot, toolkit: suggestedToolkit };
    return [mappedRobot];
  }

  private async getLogMustBeDoneRobot(
    userId: string,
    dateString: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const isLogDone = await this.robotsRepo.isLogDone(userId, dateString);
    if (isLogDone) {
      this.logger.log(`Log Done for date ${dateString}`);
      return [];
    }
    const dailyRobots = await this.robotsRepo.getDailyRobots(page);
    if (!dailyRobots.length) {
      this.logger.log(`No Daily robots`);
      return [];
    }
    const [noLogRobot] = dailyRobots.filter(
      (robot) => robot.type === RobotType.CHECKIN,
    );
    if (!noLogRobot) {
      this.logger.log(`No noLogRobot`);
      return [];
    }
    const userScheduleWithToolkit =
      await this.robotsRepo.getActiveUserScheduleWithToolkitForCheckInRobot(
        userId,
        dateString,
      );

    if (!userScheduleWithToolkit) {
      this.logger.log(`no schedule data`);
      return [];
    }
    this.logger.log(`showing log must be done robot`);
    return await this.getMappedScheduleToolkitRobot(
      noLogRobot,
      userScheduleWithToolkit,
      RobotBodyPlaceholder.CHECK_IN_TITLE,
      lang,
    );
  }

  async getShowRobotStatus(
    userId: string,
    date: string,
    page?: RobotPageType,
  ): Promise<boolean> {
    const userSession = await this.robotsHelper.getUserSessionLog(userId, date);
    if (!userSession) {
      const robots = await this.getFirstTimeInADayRobot(
        userId,
        date,
        false,
        page,
      );
      return robots.length > 0;
    }
    const [logMustBeDoneRobot, treatmentTimelineRobot] = await Promise.all([
      this.getLogMustBeDoneRobot(userId, date, page),

      this.getTreatmentTimelineNotificationRobot(userId, page),
    ]);
    return logMustBeDoneRobot.length > 0 || treatmentTimelineRobot.length > 0;
  }

  private async getMappedToolskitReminderRobot(
    robot: Robot[],
    data: ReminderScheduleToolkit,
  ): Promise<Robot[]> {
    const { schedule, toolkit } = data;
    const [toolReminderRobot] = robot;
    const page = await this.getScheduleToolkitDeeplink(schedule, toolkit);
    toolReminderRobot.body = toolReminderRobot.body.replace(
      RobotBodyPlaceholder.TOOL_KIT_NAME,
      toolkit.title,
    );
    toolReminderRobot.buttons = toolReminderRobot.buttons.map((button) => {
      if (button.action === RobotButtonAction.navigate) {
        return {
          ...button,
          page: page,
        };
      }
      return {
        ...button,
      };
    });
    return [toolReminderRobot];
  }

  private async getToolkitReminderRobot(
    userId: string,
    date: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const scheduleAndToolkit =
      await this.robotsRepo.getReminderScheduleAndToolkit(userId, date);
    if (!scheduleAndToolkit) {
      this.logger.log('reminder not available');
      return [];
    }

    const { schedule, toolkit } = scheduleAndToolkit;
    if (!schedule || !toolkit) {
      this.logger.log('ToolKit or schedule is not available');
      return [];
    }

    const dailyRobots = await this.robotsRepo.getDailyRobots(page);
    if (!dailyRobots.length) {
      this.logger.log(`No Daily robots`);
      return [];
    }
    const [toolReminderRobots] = dailyRobots.filter(
      (robot) => robot.type === RobotType.TOOL_REMINDER,
    );
    if (!toolReminderRobots) {
      this.logger.log(`No tool Reminde Robot`);
      return [];
    }

    return await this.getMappedScheduleToolkitRobot(
      toolReminderRobots,
      scheduleAndToolkit,
      RobotBodyPlaceholder.TOOL_KIT_NAME,
      lang,
    );
  }

  async getTopTipOfTheDayRobot(
    userId: string,
    date: string,
    page?: RobotPageType,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const [user, toolTipLog] = await Promise.all([
      this.robotsHelper.getUser(userId),
      this.robotsRepo.getRobotLog(userId, date, RobotType.TIP, page),
    ]);
    if (toolTipLog) {
      this.logger.log(`Tip robot already showed on ${date}`);
      return [];
    }
    const tipTopRobots = await this.robotsRepo.getTopTipOfTheRobot(date, page);
    if (!tipTopRobots.length) {
      this.logger.log(`No Top Tip of the day robots`);
    }
    const mappedTipTopRobots = tipTopRobots.map((tipTopRobot) => {
      return {
        ...tipTopRobot,
        title: 'Hi' + ' ' + `${user.user_name}` + ' ' + `${tipTopRobot.title}`,
      };
    });
    return this.getMappedRobots(mappedTipTopRobots, userId, lang);
  }

  private async getHaveNiceDayRobot(
    userId: string,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const [haveNiceDayRobot, user] = await Promise.all([
      this.robotsRepo.getHaveNiceDayRobot(),
      this.robotsHelper.getUser(userId),
    ]);

    if (!haveNiceDayRobot || !user) {
      this.logger.log('User or Have Nice Day Robot not available');
      return [];
    }
    const robot: Robot = haveNiceDayRobot as Robot;
    robot.type = RobotType.HAVE_NICE_DAY;
    robot.title = `${user.full_name}, ${robot.title} `;
    return this.getMappedRobots([robot], userId, lang);
  }

  async getSuggestedToolkit(robot: DailyRobots): Promise<Toolkit | undefined> {
    if ('suggested_toolkit_id' in robot) {
      if (!robot.suggested_toolkit_id) {
        return;
      }

      const toolkit = await this.robotsRepo.getToolkitById(
        robot.suggested_toolkit_id,
      );

      return toolkit;
    }
  }

  /**
   *  @description This function will return the mapped robots with translations and deeplinks and the suggested toolkit added.
   */
  private async getMappedRobots(
    robots: DailyRobots[],
    userId: string,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const mappedRobots = await this.addDeepLinksAndToolkitWithRobotTranslations(
      robots,
      userId,
      lang,
    );

    return mappedRobots;
  }

  async translateRobotButtons(
    buttons: RobotButton[],
    lang?: string,
  ): Promise<RobotButton[]> {
    const translatedButtons = await Promise.all(
      buttons.map((button) => {
        const [translatedButton] =
          this.translationService.getTranslations<RobotButton>(
            [button],
            ['label'],
            lang,
          );
        return translatedButton;
      }),
    );

    return translatedButtons;
  }

  async translateRobots(
    robots: DailyRobots[],
    lang?: string,
  ): Promise<DailyRobots[]> {
    const translatedRobots = await Promise.all(
      robots.map(async (robot) => {
        const [translatedRobot] =
          this.translationService.getTranslations<DailyRobots>(
            [robot],
            ['title', 'body'],
            lang,
          );

        const translatedButtons = await this.translateRobotButtons(
          robot.buttons,
          lang,
        );

        return {
          ...translatedRobot,
          buttons: translatedButtons,
        };
      }),
    );

    return translatedRobots;
  }

  async getFlowChartRobots(
    userId: string,
    lang?: string,
  ): Promise<DailyRobots[]> {
    const robots = await this.robotsRepo.getUserFlowChartRobots(userId);
    const finalRobots: FlowChartRobot[] = [];

    robots.forEach((robot) => {
      if (!robot.is_completed) {
        finalRobots.push(robot);
      }
    });

    const translatedRobots = await this.translateRobots(finalRobots, lang);
    return translatedRobots;
  }

  private async validateFlowChartRobot(
    body: FlowChartRobotInput,
  ): Promise<void> {
    if (!body.buttons.length && body.is_start_node) {
      throw new BadRequestException(`robots.include_at_least_one_button`);
    }
    if (body.buttons.length) {
      /**
       * check if robot id's in buttons are valid
       */
      const nodes: string[] = body.buttons
        .map((button) => button.robot_id)
        .filter((id): id is string => !!id);

      /**
       * start node robot must include atleast one button
       */
      if (body.is_start_node && !nodes.length) {
        throw new BadRequestException(`robots.include_atleast_on_robot`);
      }

      if (nodes.length) {
        const robots = await this.robotsRepo.getFlowChartRobotsByIds(nodes);
        const invalidRobot = nodes.find(
          (id) => !robots.map((robot) => robot.id).includes(id),
        );
        if (invalidRobot) {
          throw new BadRequestException(
            `${invalidRobot} ${this.translationService.translate(
              'robots.not_valid_robot',
            )}`,
          );
        }

        /**
         * if robot is start node it cannot include the other start node robots in buttons
         */
        const hasStartNode = robots.find((robot) => robot.is_start_node);
        if (hasStartNode) {
          throw new BadRequestException(
            `${hasStartNode.id} ${this.translationService.translate(
              'robots.is_start_node',
            )}`,
          );
        }
      }
    }
  }

  async addFlowChartRobot(
    body: FlowChartRobotInput,
  ): Promise<AddFlowChartRobotResponse> {
    await this.validateFlowChartRobot(body);
    const robot = await this.robotsRepo.saveFlowChartRobot({
      ...body,
      buttons: JSON.stringify(body.buttons),
    });
    return {
      robot,
    };
  }

  async updateFlowChartRobot(
    id: string,
    body: UpdateFlowChartRobotInput,
  ): Promise<UpdateFlowChartRobotResponse> {
    const [robot] = await this.robotsRepo.getFlowChartRobotsByIds([id]);
    if (!robot) {
      throw new NotFoundException(`robots.robot_not_found`);
    }
    const updates = { ...robot, ...body };
    await this.validateFlowChartRobot(updates);
    const updatedRobot = await this.robotsRepo.updateFlowChartRobot(id, {
      ...updates,
      buttons: JSON.stringify(updates.buttons),
    });
    return {
      robot: updatedRobot,
    };
  }

  async deleteFlowChartRobot(id: string): Promise<DeleteFlowChartResponse> {
    const [robot] = await this.robotsRepo.getFlowChartRobotsByIds([id]);
    if (!robot) {
      throw new NotFoundException(`robots.robot_not_found`);
    }
    const isLinked = await this.robotsRepo.isFlowChartRobotLinked(id);
    if (isLinked) {
      throw new BadRequestException(
        `${this.translationService.translate('robots.please_remove')} ${
          robot.title
        } ${this.translationService.translate('robots.from')} ${
          isLinked.title
        }`,
      );
    }
    await this.robotsRepo.deleteFlowChartRobot(id);
    return {
      message: `${robot.title} ${this.translationService.translate(
        'robots.deleted',
      )}`,
    };
  }

  async getFlowChartRobot(
    userId: string,
    args: GetFlowChartRobotArgs,
  ): Promise<GetFlowChartRobotResponse> {
    const { id, startNodeId } = args;
    const [robot] = await this.robotsRepo.getFlowChartRobotsByIds([id]);
    if (!robot) {
      throw new NotFoundException(`robots.robot_not_found`);
    }
    const isLastNode =
      !robot.buttons.length ||
      robot.buttons.every((button) => !button.robot_id);
    if (startNodeId && isLastNode) {
      this.logger.log(`Last node save root node in logs`);
      await this.addFlowChartRobotLog(userId, id);
    }
    return {
      robot,
    };
  }

  async addFlowChartRobotLog(
    userId: string,
    robotId: string,
  ): Promise<AddFlowChartRobotLogResponse> {
    const existingLog = await this.robotsRepo.getFlowChartRobotLog(
      userId,
      robotId,
    );
    if (!existingLog) {
      const date = getISODate(new Date());
      const robotLog: UserRobotLogDto = {
        user_id: userId,
        robot_type: RobotType.FLOW_CHART,
        robot_id: robotId,
        date,
      };
      await this.robotsRepo.addUserRobotLog(robotLog);
      this.logger.warn(`Flow chart robot completed`);
    }
    return {
      message: this.translationService.translate(`robots.success`),
    };
  }

  async updateTreatmentTimelineRobotStatus(
    userId: string,
    isRobotRead: boolean,
    notificationId: string,
  ): Promise<UpdateTreatmentTimelineRobotStatusResponse> {
    if (isRobotRead) {
      await Promise.all([
        this.removeClosedTreatmentTimelineRobotLog(userId),
        this.robotsRepo.updateUserNotificationRobotStatus(userId),
      ]);
    } else {
      await this.addClosedTreatmentTimelineRobotLog(userId, notificationId);
    }
    return {
      message: this.translationService.translate(
        `robots.treatment_timeline_status_updated`,
      ),
    };
  }
}
