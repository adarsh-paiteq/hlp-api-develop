import { Injectable, Logger } from '@nestjs/common';
import { TreatmentsQueue } from './treatments.queue';
import { OnEvent } from '@nestjs/event-emitter';
import { UserEvent, UserSignedUpEvent } from '@users/user.event';

@Injectable()
export class TreatmentsEventListener {
  private readonly logger = new Logger(TreatmentsEventListener.name);
  constructor(private readonly treatmentsQueue: TreatmentsQueue) {}

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async handleUserSignedUpEvent(payload: UserSignedUpEvent): Promise<void> {
    await this.treatmentsQueue.addCreateSignedUpUserTreatmentJob(payload);
  }
}
