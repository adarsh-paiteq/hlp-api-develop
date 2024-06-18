import { Injectable, Logger } from '@nestjs/common';
import { ChatsQueue } from './chats.queue';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ChannelFollowedEvent,
  ChannelUnfollowedEvent,
  ChannelsEvent,
} from '@channels/channels.event';

import {
  GroupCreatedEvent,
  GroupDeletedEvent,
  GroupsEvent,
} from '@groups/groups.events';
import {
  DoctorTreatmentArchiveStatusUpdatedEvent,
  StartProgramTreatmentDeletedEvent,
  TreatmentsEvent,
} from '@treatments/treatments.event';
import { ChannelsService } from '@channels/channels.service';

@Injectable()
export class ChatsListener {
  private readonly logger = new Logger(ChatsListener.name);
  constructor(
    private readonly chatsQueue: ChatsQueue,
    private readonly channelsService: ChannelsService,
  ) {}

  @OnEvent(ChannelsEvent.CHANNEL_FOLLOWED)
  async handleChannelFollowEvent(payload: ChannelFollowedEvent): Promise<void> {
    const { userChannel } = payload;
    const { channel_id } = userChannel;
    const channel = await this.channelsService.getChannelById(channel_id);
    if (!channel.is_private) {
      this.logger.log('user chat is not available for this public channel');
      return;
    }
    await this.chatsQueue.addChatUser(userChannel);
  }

  @OnEvent(ChannelsEvent.CHANNEL_UNFOLLOWED)
  async handleChannelUnfollowedEvent(
    payload: ChannelUnfollowedEvent,
  ): Promise<void> {
    const { userChannel } = payload;
    const { channel_id } = userChannel;
    const channel = await this.channelsService.getChannelById(channel_id);
    if (!channel.is_private) {
      this.logger.log('user chat is not available for this public channel');
      return;
    }
    await this.chatsQueue.deleteChatUser(userChannel);
  }

  @OnEvent(GroupsEvent.GROUP_DELETED)
  async handleGroupDeletedEvent(payload: GroupDeletedEvent): Promise<void> {
    await this.chatsQueue.addDisableGroupChatJob(payload);
  }

  @OnEvent(GroupsEvent.GROUP_CREATED)
  async handleGroupCreatedEvent(payload: GroupCreatedEvent): Promise<void> {
    await this.chatsQueue.addGroupChatAndChatUserJob(payload);
  }

  @OnEvent(TreatmentsEvent.START_PROGRAM_TREATMENT_DELETED)
  async handleStartProgramTreatmentDeletedEvent(
    payload: StartProgramTreatmentDeletedEvent,
  ): Promise<void> {
    await this.chatsQueue.addArchiveAndDisableTreatmentChatsJob(
      payload.treatment,
    );
  }

  @OnEvent(TreatmentsEvent.DOCTOR_TREATMENT_ARCHIVE_STATUS_UPDATED)
  async handleDoctorTreatmentArciveStatusUpdatedEvent(
    payload: DoctorTreatmentArchiveStatusUpdatedEvent,
  ): Promise<void> {
    await this.chatsQueue.addArchiveAndDisableDoctorTreatmentChatJob(
      payload.doctorTreatment,
    );
  }
}
