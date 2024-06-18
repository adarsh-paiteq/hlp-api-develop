import { UserChannel } from '@channels/entities/user-channel.entity';
import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { GroupCreatedEvent, GroupDeletedEvent } from '@groups/groups.events';
import { Treatment } from '@treatments/entities/treatments.entity';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';

export const CHATS_QUEUE = 'chats';
export const chatsQueueConfig: BullModuleOptions = {
  name: CHATS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerChatsQueue =
  BullModule.registerQueueAsync(chatsQueueConfig);

export enum ChatsJob {
  ADD_GROUP_CHAT_AND_CHAT_USER = '[CHATS] ADD GROUP CHAT AND CHAT USER',
  DISABLE_GROUP_CHAT = '[CHATS] DISABLE GROUP CHAT',
  ARCHIVE_AND_DISABLE_TREATMENT_CHATS = '[CHATS] ARCHIVE AND DISABLE TREATMENT CHATS',
  ADD_CHAT_USER = '[CHATS] ADD CHAT USER',
  DELETE_CHAT_USER = '[CHATS] DELETE CHAT USER',
  ARCHIVE_AND_DISABLE_DOCTOR_TREATMENT_CHAT = '[CHATS] ARCHIVE AND DISABLE DOCTOR TREATMENT CHAT',
}

@Injectable()
export class ChatsQueue {
  constructor(@InjectQueue(CHATS_QUEUE) private readonly chatsQueue: Queue) {}
  async addChatUser(payload: UserChannel): Promise<void> {
    await this.chatsQueue.add(ChatsJob.ADD_CHAT_USER, payload);
  }

  async deleteChatUser(payload: UserChannel): Promise<void> {
    await this.chatsQueue.add(ChatsJob.DELETE_CHAT_USER, payload);
  }

  async addGroupChatAndChatUserJob(payload: GroupCreatedEvent): Promise<void> {
    await this.chatsQueue.add(ChatsJob.ADD_GROUP_CHAT_AND_CHAT_USER, payload);
  }

  async addDisableGroupChatJob(payload: GroupDeletedEvent): Promise<void> {
    await this.chatsQueue.add(ChatsJob.DISABLE_GROUP_CHAT, payload);
  }

  async addArchiveAndDisableTreatmentChatsJob(
    treatment: Treatment,
  ): Promise<void> {
    await this.chatsQueue.add(
      ChatsJob.ARCHIVE_AND_DISABLE_TREATMENT_CHATS,
      treatment,
    );
  }

  async addArchiveAndDisableDoctorTreatmentChatJob(
    doctorTreatment: DoctorTreatment,
  ): Promise<void> {
    await this.chatsQueue.add(
      ChatsJob.ARCHIVE_AND_DISABLE_DOCTOR_TREATMENT_CHAT,
      doctorTreatment,
    );
  }
}
