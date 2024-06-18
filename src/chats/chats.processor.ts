import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CHATS_QUEUE, ChatsJob } from './chats.queue';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import Bull from 'bull';
import { GroupCreatedEvent, GroupDeletedEvent } from '@groups/groups.events';
import { UserChannel } from '@channels/entities/user-channel.entity';
import { Treatment } from '@treatments/entities/treatments.entity';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';

@Processor(CHATS_QUEUE)
export class ChatsProcessor extends ProcessorLogger {
  readonly logger = new Logger(ChatsProcessor.name);
  constructor(private readonly chatsService: ChatsService) {
    super();
  }

  @Process({
    name: ChatsJob.ADD_GROUP_CHAT_AND_CHAT_USER,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddGroupChatAndChatUserJob(
    job: Bull.Job<GroupCreatedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return await this.chatsService.addGroupChatAndChatUser(payload.group);
    } catch (error) {
      this.logger.error(
        `${this.handleAddGroupChatAndChatUserJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: ChatsJob.DISABLE_GROUP_CHAT,
    concurrency: defaultWorkersConcurrency,
  })
  async handleDisableGroupChatJob(
    job: Bull.Job<GroupDeletedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { group },
      } = job;
      return await this.chatsService.disableGroupChat(group);
    } catch (error) {
      this.logger.error(
        `${this.handleDisableGroupChatJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: ChatsJob.ARCHIVE_AND_DISABLE_TREATMENT_CHATS,
    concurrency: defaultWorkersConcurrency,
  })
  async handleArchiveAndDisableTreatmentChatsJob(
    job: Bull.Job<Treatment>,
  ): Promise<string> {
    try {
      const { data: treatment } = job;
      return await this.chatsService.archiveAndDisableTreatmentChats(treatment);
    } catch (error) {
      this.logger.error(
        `${this.handleArchiveAndDisableTreatmentChatsJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: ChatsJob.ADD_CHAT_USER,
    concurrency: defaultWorkersConcurrency,
  })
  async addChatUser(job: Bull.Job<UserChannel>): Promise<string> {
    const { data } = job;
    const { channel_id, user_id } = data;
    return await this.chatsService.addChatUser(user_id, channel_id);
  }

  @Process({
    name: ChatsJob.DELETE_CHAT_USER,
    concurrency: defaultWorkersConcurrency,
  })
  async deleteChatUser(job: Bull.Job<UserChannel>): Promise<string> {
    const { data } = job;
    const { channel_id, user_id } = data;
    return await this.chatsService.deleteChatUser(user_id, channel_id);
  }

  @Process({
    name: ChatsJob.ARCHIVE_AND_DISABLE_DOCTOR_TREATMENT_CHAT,
    concurrency: defaultWorkersConcurrency,
  })
  async handleArchiveAndDisableDoctorTreatmentChatJob(
    job: Bull.Job<DoctorTreatment>,
  ): Promise<string> {
    try {
      const { data: doctorTreatment } = job;
      return await this.chatsService.archiveAndDisableDoctorTreatmentChat(
        doctorTreatment,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleArchiveAndDisableDoctorTreatmentChatJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
