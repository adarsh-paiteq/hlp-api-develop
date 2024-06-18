import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ChatsRepo } from './chats.repo';
import { UserChannel } from '@channels/entities/user-channel.entity';
import { ChatsQueue } from './chats.queue';
import { Server as SocketIOServer } from 'socket.io';
import {
  ChatMessageAttachment,
  ChatMessageData,
  GetChatMessagesArgs,
  GetChatMessagesResponse,
} from './dto/get-chat-messages.dto';
import { ChatUserInfo, GetChatArgs, GetChatResponse } from './dto/get-chat.dto';
import {
  CreateChatFileUploadsDTO,
  CreateChatMessageDTO,
  CreateChatMessageInput,
  CreateChatMessageResponse,
} from './dto/create-chat-message.dto';
import { ChatType } from './entities/chat.entity';
import { Group } from '@groups/entities/groups.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  UpdateArchivedUnarchiveStatusArgs,
  UpdateUserChatArchiveStatusRes,
} from './dto/archive-unarchive-chat.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import {
  CreateChatDto,
  CreateChatUserDto,
  StartChatArgs,
  StartChatResponse,
} from './dto/start-chat.dto';
import { GetChatListArgs, GetChatListResponse } from './dto/get-chat-list.dto';
import { JoinChatBody } from './dto/join-chat.dto';
import { SocketClient } from '@core/middlewares/ws-auth.middleware';
import {
  DeleteUserChatArgs,
  DeleteUserChatRes,
} from './dto/delete-user-chat.dto';
import { WEBSOCKET_CLIENT_EVENT } from '@core/constants';
import { SortOrder } from '@utils/utils.dto';
import { UsersService } from '@users/users.service';
import { Treatment } from '@treatments/entities/treatments.entity';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';
import { UserRoles } from '@users/users.dto';

@Injectable()
export class ChatsService {
  private logger = new Logger(ChatsService.name);
  constructor(
    private readonly chatsRepo: ChatsRepo,
    private readonly chatsQueue: ChatsQueue,
    private readonly translationService: TranslationService,
    private readonly usersService: UsersService,
  ) {}

  async addChatUser(userId: string, channelId: string): Promise<string> {
    const chat = await this.chatsRepo.getChatByGroupId(channelId);
    const { id: chatId } = chat;
    const chatUser = await this.chatsRepo.getChatUser(userId, chatId);
    if (chatUser?.is_deleted) {
      await this.chatsRepo.updateChatUser(chatUser.id, { is_deleted: false });
      return `Chat user found, enabled chat user`;
    }
    const inputUserChat: CreateChatUserDto = {
      chat_id: chatId,
      user_id: userId,
    };
    await this.chatsRepo.createChatUser(inputUserChat);
    return `chat user created `;
  }

  async deleteChatUser(userId: string, channelId: string): Promise<string> {
    const chat = await this.chatsRepo.getChatByGroupId(channelId);
    const { id: chatId } = chat;
    const chatUser = await this.chatsRepo.getChatUser(userId, chatId);
    if (!chatUser) {
      return 'Chat User Not found';
    }

    await this.chatsRepo.updateChatUser(chatUser.id, { is_deleted: true });
    return `chat user deleted`;
  }

  async addUserChatRecord(body: UserChannel): Promise<void> {
    await this.chatsQueue.addChatUser(body);
  }

  async startChat(
    loggedInUserId: string,
    args: StartChatArgs,
  ): Promise<StartChatResponse> {
    const { id, chatType, treatment_id } = args;

    if (chatType === ChatType.CHANNEL) {
      const group = await this.chatsRepo.getGroupById(id);
      if (!group) {
        throw new NotFoundException(`groups.group_not_found`);
      }
      return await this.startChannelChat(loggedInUserId, args);
    }

    if (chatType === ChatType.ONE_ON_ONE) {
      const requests = [];

      const userRequest = this.chatsRepo.getUserById(id);
      requests.push(userRequest);

      if (treatment_id) {
        const treatmentRequest = this.chatsRepo.getTreatmentById(treatment_id);
        requests.push(treatmentRequest);
      }
      const [user, treatment] = await Promise.all(requests);

      if (!user) {
        throw new NotFoundException(`chat_users.user_not_found`);
      }

      if (treatment_id && !treatment) {
        throw new NotFoundException(`chat_users.user_not_found`);
      }

      return await this.startOneOnOneChat(loggedInUserId, args);
    }

    throw new BadRequestException(`chat_users.failed_to_start_chat`);
  }

  async startOneOnOneChat(
    loggedInUserId: string,
    args: StartChatArgs,
  ): Promise<StartChatResponse> {
    const { id: userId, page, limit, sortOrder, treatment_id } = args;

    const chat = await this.chatsRepo.getOneOnOneChat(
      loggedInUserId,
      userId,
      treatment_id,
    );
    let chatId = chat?.id;

    if (!chatId) {
      this.logger.log(`One-On-One Chat Not Found, adding chat record`);
      const chatUser = await this.chatsRepo.createOneOnOneChatAndChatUsers(
        loggedInUserId,
        userId,
        treatment_id,
      );
      chatId = chatUser.chat_id;
    }

    return await this.getChatWithMessages(
      chatId,
      loggedInUserId,
      sortOrder,
      page,
      limit,
    );
  }

  async startChannelChat(
    loggedInUserId: string,
    args: StartChatArgs,
  ): Promise<StartChatResponse> {
    const { id: channelId, page, limit, sortOrder } = args;
    const chat = await this.chatsRepo.getChannelChat(loggedInUserId, channelId);
    if (!chat) {
      throw new NotFoundException(`chat_users.chat_not_found`);
    }
    return await this.getChatWithMessages(
      chat.id,
      loggedInUserId,
      sortOrder,
      page,
      limit,
    );
  }

  async getChatMessages(
    args: GetChatMessagesArgs,
  ): Promise<GetChatMessagesResponse> {
    const { chatMessages, total } = await this.chatsRepo.getChatMessages(args);
    const hasMore = args.page * args.limit < total;
    return { chatMessages, hasMore };
  }

  async getChatWithMessages(
    chatId: string,
    loggedInUserId: string,
    sortOrder: SortOrder,
    page = 1,
    limit = 30,
  ): Promise<GetChatResponse> {
    const [chat, { chatMessages, hasMore }] = await Promise.all([
      this.chatsRepo.getChatDetails(chatId, loggedInUserId),
      this.getChatMessages({ chatId, page, limit, sortOrder }),
    ]);

    if (!chat) {
      throw new NotFoundException(`chat_users.chat_not_found`);
    }
    //status of the opposite user that we are chatting with. this is not the status of logged in user
    const isActive = await this.usersService.isUserActive(chat.user.id);
    return { chat, isActive, chatMessages, hasMore };
  }

  async getChat(
    loggedInUserId: string,
    args: GetChatArgs,
  ): Promise<GetChatResponse> {
    const { chatId, sortOrder } = args;
    const chatData = await this.chatsRepo.getChatByChatIdAndUserId(
      chatId,
      loggedInUserId,
    );
    if (!chatData) {
      throw new NotFoundException(`chat_users.chat_not_found`);
    }
    if (chatData.chat_type === ChatType.ONE_ON_ONE) {
      await this.chatsRepo.readChatMessages(chatId, loggedInUserId);
    }
    return await this.getChatWithMessages(
      chatId,
      loggedInUserId,
      sortOrder,
      args.page,
      args.limit,
    );
  }

  async createChatMessage(
    userId: string,
    input: CreateChatMessageInput,
  ): Promise<CreateChatMessageResponse> {
    const { chatId, attachments, message } = input;

    const [user, chat] = await Promise.all([
      this.chatsRepo.getUserById(userId),
      this.chatsRepo.getChatByChatIdAndUserId(chatId, userId),
    ]);

    if (!user) {
      throw new NotFoundException(`chat_users.user_not_found`);
    }
    if (!chat) {
      throw new NotFoundException(`chat_users.chat_not_found`);
    }

    const chatAttachments: ChatMessageAttachment[] = [];
    const chatUser: ChatUserInfo = {
      id: user.id,
      role: user.role,
      user_name: user.user_name,
      avatar_image_name: user.avatar_image_name,
      file_path: user.file_path,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_type: user.avatar_type,
    };

    const createMessageDto: CreateChatMessageDTO = {
      chat_id: chatId,
      sender_id: userId,
      message,
    };

    const createdChatMessage = await this.chatsRepo.createChatMessage(
      createMessageDto,
    );

    if (attachments?.length) {
      const createChatFileUploadsDto: CreateChatFileUploadsDTO[] =
        attachments.map((attachment): CreateChatFileUploadsDTO => {
          return {
            ...attachment,
            chat_id: chatId,
            chat_message_id: createdChatMessage.id,
            user_id: userId,
          };
        });

      const chatFileUploads = await this.chatsRepo.createChatFileUploads(
        createChatFileUploadsDto,
      );

      chatFileUploads.forEach((fileUpload) => {
        const attachment: ChatMessageAttachment = {
          id: fileUpload.id,
          file_path: fileUpload.file_path,
          file_type: fileUpload.file_type,
          thumbnail_image_id: fileUpload.thumbnail_image_id,
          thumbnail_image_id_path: fileUpload.thumbnail_image_id_path,
          thumbnail_image_url: fileUpload.thumbnail_image_url,
        };
        chatAttachments.push(attachment);
      });
    }

    const chatMessage: ChatMessageData = {
      ...createdChatMessage,
      attachments: chatAttachments,
      user: chatUser,
    };

    return {
      chatMessage,
      chat,
    };
  }

  async addGroupChatAndChatUser(payload: Group): Promise<string> {
    const { id, created_by } = payload;

    const createChat: CreateChatDto = {
      id: uuidv4(),
      chat_type: ChatType.CHANNEL,
      channel_id: id,
    };

    await this.chatsRepo.createChat(createChat);

    const createChatUser: CreateChatUserDto = {
      chat_id: createChat.id,
      user_id: created_by,
    };

    await this.chatsRepo.createChatUser(createChatUser);

    return `Chat and Chat User Created Successfully`;
  }

  async disableGroupChat(group: Group): Promise<string> {
    const { id } = group;
    const chat = await this.chatsRepo.getChatByGroupId(id);
    if (!chat) {
      return `Chat Not found`;
    }
    const updatedChat = await this.chatsRepo.updateChatDisableStatus(
      chat.id,
      true,
    );
    return `Chat with ${updatedChat.id} has been disabled successfully.`;
  }

  async archiveAndDisableTreatmentChats(payload: Treatment): Promise<string> {
    const { id } = payload;
    const treatment = await this.chatsRepo.getTreatment(id);
    if (!treatment) {
      return 'Treatment Not Found';
    }
    const updatedChat = await this.chatsRepo.archiveAndDisableTreatmentChats(
      id,
    );
    return `Chat with ${updatedChat.id} has been Archived and disabled successfully.`;
  }

  async updateUserChatArchiveStatus(
    userId: string,
    args: UpdateArchivedUnarchiveStatusArgs,
    role: UserRoles,
  ): Promise<UpdateUserChatArchiveStatusRes> {
    const { isArchived, chatId } = args;
    const chatUser = await this.chatsRepo.getChatUser(userId, chatId);

    if (!chatUser) {
      throw new NotFoundException(`chat_users.chat_user_not_found`);
    }

    if (chatUser.is_archived === isArchived) {
      const errorMessage = chatUser.is_archived
        ? 'chat_users.chat_already_archived'
        : 'chat_users.chat_already_unarchived';
      throw new NotFoundException(errorMessage);
    }

    const updatedChatUser = await this.chatsRepo.updateChatUser(chatUser.id, {
      is_archived: isArchived,
    });

    if (role === UserRoles.DOCTOR) {
      await this.chatsRepo.updateChatDisableStatus(chatId, isArchived);
    }
    const messageKey = updatedChatUser.is_archived
      ? 'chat_users.chat_users_archived'
      : 'chat_users.chat_users_unarchived';
    const translatedChat = this.translationService.translate(messageKey);
    return {
      message: translatedChat,
    };
  }

  async getChatList(
    userId: string,
    args: GetChatListArgs,
  ): Promise<GetChatListResponse> {
    const { chatList, total } = await this.chatsRepo.getChatList(userId, args);
    const hasMore = args.page * args.limit < total;
    return { chatList, hasMore };
  }

  async deleteUserChat(
    userId: string,
    args: DeleteUserChatArgs,
  ): Promise<DeleteUserChatRes> {
    const { chatId } = args;
    const chatUser = await this.chatsRepo.getChatUser(userId, chatId);
    if (!chatUser) {
      throw new NotFoundException(`chat_users.chat_user_not_found`);
    }
    if (chatUser.is_deleted) {
      throw new NotFoundException(`chat_users.chat_user_already_deleted`);
    }
    await this.chatsRepo.updateChatUser(chatUser.id, {
      is_deleted: true,
    });
    return {
      message: this.translationService.translate(
        `chat_users.chat_user_deleted`,
      ),
    };
  }

  async joinChat(body: JoinChatBody, client: SocketClient): Promise<void> {
    const { chatId } = body;
    const userId = client.user.id;
    const chat = await this.chatsRepo.getChatByChatIdAndUserId(chatId, userId);
    if (!chat) {
      throw new NotFoundException(`Chat Not found`);
    }
    await client.join(chat.id);
    this.logger.log(`user joined room`);
    await client.emitWithAck(WEBSOCKET_CLIENT_EVENT.CHATS_JOIN_ACK(userId), {
      chatId,
    });
  }

  async sendChatMessage(
    body: CreateChatMessageInput,
    client: SocketClient,
    server: SocketIOServer,
  ): Promise<void> {
    const { chatId } = body;
    const userId = client.user.id;
    const { chatMessage, chat } = await this.createChatMessage(userId, body);

    this.logger.log(`chat message sent`);
    server
      .to(chatId)
      .emit(WEBSOCKET_CLIENT_EVENT.CHATS_MESSAGE(chatId), chatMessage);

    if (chat.chat_type === ChatType.ONE_ON_ONE) {
      const chatUser = await this.chatsRepo.getChatUserByChatId(chatId, userId);
      if (!chatUser) {
        throw new NotFoundException('chat user not found');
      }

      //send to the sender
      this.logger.log(`sending one on one chat to sender ${userId}`);
      client.emit(
        WEBSOCKET_CLIENT_EVENT.USERS_CHAT_UPDATES(userId),
        chatMessage,
      );

      //send to the receiver
      this.logger.log(
        `sending one on one chat to receiver ${chatUser.user_id}`,
      );
      server.emit(
        WEBSOCKET_CLIENT_EVENT.USERS_CHAT_UPDATES(chatUser.user_id),
        chatMessage,
      );
    }

    if (chat.chat_type === ChatType.CHANNEL && chat.channel_id) {
      const userChannels = await this.chatsRepo.getChannelUsers(
        chat.channel_id,
      );

      userChannels.forEach((user) => {
        //send to the receiver of group chat
        this.logger.log(`sending channel chat to ${user.user_id}`);
        server.emit(
          WEBSOCKET_CLIENT_EVENT.USERS_CHAT_UPDATES(user.user_id),
          chatMessage,
        );
      });
    }
  }

  async archiveAndDisableDoctorTreatmentChat(
    doctorTreatment: DoctorTreatment,
  ): Promise<string> {
    const { treatment_id, doctor_id, is_archived } = doctorTreatment;
    const treatment = await this.chatsRepo.getTreatmentById(treatment_id);

    if (!treatment) {
      return 'Treatment Not Found';
    }

    const chat = await this.chatsRepo.getOneOnOneChat(
      doctor_id,
      treatment.user_id,
      treatment.id,
    );

    if (!chat) {
      return 'Chat Not Found';
    }

    await this.chatsRepo.updateDoctorTreatmentChatDisableAndArchiveStatus(
      treatment.id,
      chat.id,
      is_archived,
    );

    return `Chat status updated successfully`;
  }
}
