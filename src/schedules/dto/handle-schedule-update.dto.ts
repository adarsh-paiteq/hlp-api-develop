import { ScheduleEntity } from '../entities/schedule.entity';

/**
 * @description The @function handleScheduleUpdate()  functions in the schedules controller use DTOs
 */
export class HandleScheduleUpdateBody {
  data: ScheduleEntity;
}

export class HandleScheduleUpdateResponse {
  message: string;
}
