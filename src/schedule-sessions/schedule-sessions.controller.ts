import { Body, Controller, Post } from '@nestjs/common';
import {
  BaseToolKitAnswer,
  Data,
  EventDto,
  HasuraEventPayload,
} from './schedule-sessions.dto';
import { ScheduleSessionsService } from './schedule-sessions.service';

@Controller('schedule-sessions')
export class ScheduleSessionsController {
  constructor(
    private readonly scheduleSessionsService: ScheduleSessionsService,
  ) {}

  /**
   * @description Event trigger used for answer generation toolkits.
   */
  @Post('/')
  async addScheduleSession(
    @Body() body: HasuraEventPayload<EventDto<Data>>,
  ): Promise<void> {
    return this.scheduleSessionsService.addScheduleSession(body.event.data.new);
  }

  /**
   * @description Event trigger used for answer generation toolkits, primarily used for testing purposes.
   */
  @Post('/test')
  async addScheduleSessionTest(@Body() body: BaseToolKitAnswer): Promise<void> {
    return this.scheduleSessionsService.addScheduleSession(body);
  }
}
