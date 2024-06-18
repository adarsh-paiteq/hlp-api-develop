import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Schedule } from '../schedules/schedules.dto';
import { BaseToolKitAnswer, ScheduleSessionDto } from './schedule-sessions.dto';
import {
  ScheduleSessionAddedEvent,
  ScheduleSessionEvent,
} from './schedule-sessions.event';
import { ScheduleSessionsRepo } from './schedule-sessions.repo';
import { ToolkitType } from '../toolkits/toolkits.model';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class ScheduleSessionsService {
  constructor(
    private readonly scheduleSessionsRepo: ScheduleSessionsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}
  private readonly logger = new Logger(ScheduleSessionsService.name);

  /**
   * @description This service is utilized by the functions @function addScheduleSession() and @function addScheduleSessionTest() within the schedule-session controller. 
     The schedule-session controller is an integral part of answer generation toolkits, responsible for managing the scheduling of sessions. 
     This service plays a crucial role in facilitating the scheduling functionality within the toolkit.
   */
  async addScheduleSession(answer: BaseToolKitAnswer): Promise<void> {
    const isEpisodeTool = answer.episode_id && answer.episode_session_id;
    if (isEpisodeTool) {
      this.logger.log(`Tool belongs to episode`);
      return;
    }

    //When form is performed from appointment we skip saving session for it.
    const isAppointment =
      answer.user_appointment_id && answer.appointment_session_id;
    if (isAppointment) {
      this.logger.log(`Form belongs to appointment`);
      return;
    }

    const { session_id, schedule_id } = answer;
    const isSessionExist = await this.scheduleSessionsRepo.isSessionExist(
      session_id,
    );
    if (isSessionExist) {
      const message = `${session_id} ${this.translationService.translate(
        'schedule-sessions.already_exists',
      )}`;
      this.logger.warn(message);
      throw new BadRequestException(message);
    }
    const schedule = await this.scheduleSessionsRepo.getScheduleById(
      schedule_id,
    );
    if (!schedule) {
      const message = `${schedule_id} ${this.translationService.translate(
        'schedule-sessions.schedule_not_found',
      )}`;
      this.logger.warn(message);
      throw new NotFoundException(message);
    }

    const toolkit = schedule?.toolKitByToolKit;
    if (toolkit && toolkit.tool_kit_type === ToolkitType.MEDICATION) {
      await this.reduceMedicationStock(answer);
    }

    let habitToolId: string | undefined;
    if (answer.day_id && answer.tool_kit_id) {
      this.logger.log(`Habit series toolkit`);
      const habitTool = await this.scheduleSessionsRepo.getHabitTool(
        answer.day_id,
        answer.tool_kit_id,
      );
      if (!habitTool) {
        this.logger.warn(`Habit tool not found`);
      }
      habitToolId = habitTool.id;
    }

    return this.saveScheduleSession(
      { ...schedule, habit_tool_id: habitToolId },
      answer,
    );
  }

  /**
   * @description This service is used by the @function addScheduleSession() function within the schedule-session service.
     It plays a crucial role in managing the scheduling of sessions, providing necessary functionality and logic for adding new schedule sessions to the system.
   */
  private async reduceMedicationStock(
    answer: BaseToolKitAnswer,
  ): Promise<void> {
    const { user_id, schedule_id } = answer;
    const medicationPlans = await this.scheduleSessionsRepo.getMedicationPlans(
      user_id,
      schedule_id,
    );
    if (!medicationPlans.length) {
      this.logger.warn(`no medication plan for schedule ${schedule_id}`);
      return;
    }
    const [medication] = medicationPlans;
    const { stock } = medication;
    const availableStock =
      stock - answer['doses'] < 0 ? 0 : stock - answer['doses'];
    this.logger.log(`available stock ${availableStock}`);
    await this.scheduleSessionsRepo.updateStock(medication.id, availableStock);
  }

  /**
   * @description This service is utilized by the  @function addScheduleSession() function within the schedule-session service. 
     The schedule-session service is responsible for managing the scheduling of sessions. 
     This specific service function plays a key role in adding new schedule sessions, handling the necessary logic and data manipulation required for scheduling functionality within the service.
   */
  private async saveScheduleSession(
    schedule: Schedule & { habit_tool_id?: string },
    answer: BaseToolKitAnswer,
  ): Promise<void> {
    const session: ScheduleSessionDto = {
      user_id: answer.user_id,
      schedule_id: answer.schedule_id,
      session_date: answer.session_date,
      session_id: answer.session_id,
    };

    //answer.toolkit_id is a user toolkit id
    if (answer.toolkit_id) {
      session['user_toolkit_id'] = answer.toolkit_id;
    }

    if (answer.tool_kit_id) {
      session['tool_kit_id'] = answer.tool_kit_id;
    }

    if (schedule.check_in) {
      session['checkin_id'] = schedule.check_in;
    }

    if (schedule.challenge_id) {
      session['challenge_id'] = schedule.challenge_id;
    }

    if (answer.appointment_id) {
      session.user_appointment_id = answer.appointment_id;
    }

    if (schedule.habit_tool_id) {
      session.habit_tool_id = schedule.habit_tool_id;
    }

    const newSession = await this.scheduleSessionsRepo.addScheduleSession(
      session,
    );

    this.logger.log(`Session saved ${newSession}`);

    this.eventEmitter.emit(
      ScheduleSessionEvent.SESSION_ADDED,
      new ScheduleSessionAddedEvent(newSession),
    );
  }
}
