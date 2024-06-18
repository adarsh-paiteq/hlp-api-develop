import { Database } from '@core/modules/database/database.service';
import { Injectable } from '@nestjs/common';
import { Chat, ChatType } from './entities/chat.entity';
import { ChatDetails } from './dto/get-chat.dto';
import {
  ChatMessageData,
  GetChatMessagesArgs,
} from './dto/get-chat-messages.dto';
import {
  CreateChatFileUploadsDTO,
  CreateChatMessageDTO,
} from './dto/create-chat-message.dto';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatFileUpload } from './entities/chat-file-upload.entity';
import { CreateChatDto, CreateChatUserDto } from './dto/start-chat.dto';
import { ChatUser } from './entities/chat-user.entity';
import { Group } from '@groups/entities/groups.entity';
import { Users } from '@users/users.model';
import { ChatUserUpdate } from './dto/archive-unarchive-chat.dto';
import {
  ChatList,
  ChatTypeFilter,
  GetChatListArgs,
} from './dto/get-chat-list.dto';
import { UserChannel } from '@channels/entities/user-channel.entity';
import { Treatment } from '@treatments/entities/treatments.entity';

@Injectable()
export class ChatsRepo {
  constructor(private readonly database: Database) {}

  async getChannelChat(userId: string, channelId: string): Promise<Chat> {
    const query = `
    SELECT 
      DISTINCT ON (chats.id) chats.* 
    FROM 
      chat_users AS chat_users_join
    LEFT JOIN 
      chat_users ON chat_users_join.chat_id = chat_users.chat_id AND chat_users_join.user_id = $1
    LEFT JOIN 
      chats ON chat_users.chat_id = chats.id
    WHERE chats.channel_id = $2 AND chats.chat_type =$3`;
    const [chat] = await this.database.query<Chat>(query, [
      userId,
      channelId,
      ChatType.CHANNEL,
    ]);
    return chat;
  }

  async getOneOnOneChat(
    loggedInUserId: string,
    userId: string,
    treatmentId?: string,
  ): Promise<Chat | null> {
    let query = `
    SELECT
      DISTINCT ON (chats.id) chats.*
    FROM
      chat_users AS chat_users_join
    LEFT JOIN 
      chat_users ON chat_users_join.chat_id = chat_users.chat_id AND chat_users_join.user_id = $1
    LEFT JOIN 
      chats ON chat_users.chat_id = chats.id
    WHERE
      chat_users.user_id = $2 AND chats.chat_type =$3 `;

    const params = [loggedInUserId, userId, ChatType.ONE_ON_ONE];

    if (treatmentId) {
      query = query + ' AND chats.treatment_id = $4';
      params.push(treatmentId);
    }

    const [chat] = await this.database.query<Chat>(query, params);
    return chat;
  }

  async getChatById(chatId: string): Promise<Chat> {
    const query = `SELECT chats.* FROM chats WHERE chats.id = $1`;
    const [chat] = await this.database.query<Chat>(query, [chatId]);
    return chat;
  }

  /**
   * Generates a LEFT JOIN LATERAL subquery for joining a chat-related table with the 'users' table.
   *
   * @param tableName - The name of the table to join (default: 'chat_users').
   * @param fieldName - The field name in the specified table to compare with the 'users' table (default: 'user_id').
   * @returns A string representing the LEFT JOIN LATERAL subquery for linking chat-related data with user data.
   */
  private getChatUserJoin(
    tableName = 'chat_users',
    fieldName = 'user_id',
  ): string {
    return ` LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.avatar_image_name,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role,
      users.file_path,
      users.avatar_type
    FROM
      users
    WHERE
      ${tableName}.${fieldName} = users.id
  ) AS users ON true`;
  }

  private getChatChannelJoin(): string {
    return ` LEFT JOIN LATERAL (
      SELECT
        channels.id,
        channels.title,
        channels.description,
        channels.short_description,
        channels.image_file_path,
        ( SELECT CAST(COALESCE(COUNT(user_channels.*),'0') AS INTEGER) 
        FROM user_channels WHERE user_channels.channel_id = channels.id AND user_channels.is_channel_unfollowed = false ) AS total_followers
      FROM
        channels
      WHERE
        user_channels.channel_id = channels.id
    ) AS channels ON true`;
  }

  async getChatDetails(
    chatId: string,
    loggedInUserId: string,
  ): Promise<ChatDetails> {
    const query = `SELECT
    chat_users.chat_id,
    chats.chat_type,
    chats.is_disabled,
    chats.treatment_id,
    chat_users.is_archived,
    chat_users.is_deleted,
    chat_users.created_at,
    ROW_TO_JSON(users.*) AS user,
    ROW_TO_JSON(channels.*) AS channel
  FROM
    chat_users
    LEFT JOIN chats ON chat_users.chat_id = chats.id
    ${this.getChatUserJoin()}
    LEFT JOIN user_channels ON chats.channel_id = user_channels.channel_id AND user_channels.user_id = $2
    ${this.getChatChannelJoin()}
  WHERE
    chats.id = $1
    AND (
      ( 
        chat_users.user_id <> $2 AND chats.chat_type = $3 
      )
      OR ( 
        chat_users.user_id = $2 AND chats.chat_type = $4 
        )
     )
  GROUP BY
    chat_users.id,
    chats.id,
    users.*,
    channels.*`;
    const [chatDetails] = await this.database.query<ChatDetails>(query, [
      chatId,
      loggedInUserId,
      ChatType.ONE_ON_ONE,
      ChatType.CHANNEL,
    ]);
    return chatDetails;
  }

  private getChatUploadsSubQuery(): string {
    return `COALESCE(
      (
        SELECT
          JSON_AGG(chat_file_upload.*)
        FROM
          (
            SELECT
              chat_file_uploads.id,
              chat_file_uploads.file_path,
              chat_file_uploads.file_type,
              chat_file_uploads.thumbnail_image_id,
              chat_file_uploads.thumbnail_image_id_path,
              chat_file_uploads.thumbnail_image_url
            FROM
              chat_file_uploads
            WHERE
              chat_messages.id = chat_file_uploads.chat_message_id
            ORDER BY
              chat_file_uploads.created_at DESC
          ) AS chat_file_upload
      ),
      '[]'
    ) AS attachments`;
  }

  private getLastMessageJoin(): string {
    return ` LEFT JOIN LATERAL (
      SELECT
        chat_messages.id,
        chat_messages.chat_id,
        chat_messages.message,
        chat_messages.is_read,
        chat_messages.created_at,
        chat_messages.sender_id,
        ROW_TO_JSON(users.*) AS user,
       ${this.getChatUploadsSubQuery()}
      FROM
        chat_messages
      WHERE
        chat_messages.is_deleted = false
        AND chat_messages.chat_id = chat_users.chat_id
      ORDER BY
        chat_messages.created_at DESC
      LIMIT
        1
    ) AS chat_message ON true`;
  }

  private getUnreadMessagesCountJoin(): string {
    return ` LEFT JOIN LATERAL (
      SELECT
        CAST(COALESCE(COUNT(*), '0') AS INTEGER) AS unread_messages_count
      FROM
        chat_messages
      WHERE
        chat_messages.is_read = false
        AND chat_messages.chat_id = chat_users.chat_id
        AND chat_messages.sender_id <> $1
    ) AS unread_messages_count ON true`;
  }

  async getChatMessages(
    args: GetChatMessagesArgs,
  ): Promise<{ chatMessages: ChatMessageData[]; total: number }> {
    const { chatId, limit, page, sortOrder } = args;
    const offset = (page - 1) * limit;

    const queryWithoutPagination = `SELECT 
    CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM chat_messages 
    WHERE chat_messages.is_deleted = false AND chat_messages.chat_id = $1 `;

    const query = `SELECT
    chat_messages.id,
    chat_messages.chat_id,
    chat_messages.message,
    chat_messages.is_read,
    chat_messages.created_at,
    ROW_TO_JSON(users) AS user,
    ${this.getChatUploadsSubQuery()}
    FROM
      chat_messages
     ${this.getChatUserJoin('chat_messages', 'sender_id')}
    WHERE
      chat_messages.is_deleted = false
      AND chat_messages.chat_id = $1
    ORDER BY
      chat_messages.created_at ${sortOrder}
    LIMIT $2 OFFSET $3`;

    const [chatMessages, [{ total }]] = await Promise.all([
      this.database.query<ChatMessageData>(query, [chatId, limit, offset]),
      this.database.query<{ total: number }>(queryWithoutPagination, [chatId]),
    ]);
    return { chatMessages, total };
  }

  async createChatMessage(
    createMessageDto: CreateChatMessageDTO,
  ): Promise<ChatMessage> {
    const keys = Object.keys(createMessageDto);
    const values = Object.values(createMessageDto);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO chat_messages (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [chatMessage] = await this.database.query<ChatMessage>(query, values);

    return chatMessage;
  }

  async createChatFileUploads(
    fileUploadsDto: CreateChatFileUploadsDTO[],
  ): Promise<ChatFileUpload[]> {
    const query = fileUploadsDto
      .map((fileUpload) => {
        const columns = Object.keys(fileUpload).join(', ');
        const values = Object.values(fileUpload)
          .map((value) => `'${value}'`)
          .join(',');
        return `INSERT INTO chat_file_uploads (${columns}) VALUES (${values}) RETURNING *;`;
      })
      .join('');
    const fileUploads = await this.database.batchQuery<ChatFileUpload>(query);
    return fileUploads.map((fileUpload) => fileUpload[0]);
  }

  async getChatByGroupId(groupId: string): Promise<Chat> {
    const query = `SELECT chats.* FROM chats WHERE channel_id = $1`;
    const [data] = await this.database.query<Chat>(query, [groupId]);
    return data;
  }

  async updateChatDisableStatus(
    chatId: string,
    isDisabled: boolean,
  ): Promise<Chat> {
    const query = `
      UPDATE chats SET is_disabled=$1 WHERE id=$2 RETURNING *;`;
    const [updatedChat] = await this.database.query<Chat>(query, [
      isDisabled,
      chatId,
    ]);
    return updatedChat;
  }

  async createChat(data: CreateChatDto): Promise<Chat> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO chats (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [chat] = await this.database.query<Chat>(query, values);
    return chat;
  }

  async createChatUser(data: CreateChatUserDto): Promise<ChatUser> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO chat_users (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [savedChatUser] = await this.database.query<ChatUser>(query, values);
    return savedChatUser;
  }

  async createOneOnOneChatAndChatUsers(
    loggedInUserId: string,
    userId: string,
    treatmentId?: string,
  ): Promise<ChatUser> {
    const query = `
    WITH chats AS (
      INSERT INTO chats (chat_type ${treatmentId ? ', treatment_id' : ' '} )
      VALUES ($1 ${treatmentId ? ', $4' : ' '}) RETURNING *
    )
    INSERT INTO chat_users (chat_id, user_id ${
      treatmentId ? ', treatment_id' : ' '
    })
    --save first user into chat_users
    SELECT id, $2:: uuid ${treatmentId ? ', $4:: uuid' : ' '} FROM chats 
    UNION ALL
    --save second user into chat_users
    SELECT id, $3:: uuid ${treatmentId ? ', $4:: uuid' : ' '} FROM chats 
    RETURNING *`;

    const params = [ChatType.ONE_ON_ONE, loggedInUserId, userId];
    if (treatmentId) {
      params.push(treatmentId);
    }
    const [chatUser] = await this.database.query<ChatUser>(query, params);
    return chatUser;
  }

  async getGroupById(id: string): Promise<Group> {
    const query = 'SELECT * FROM channels WHERE id = $1';
    const [group] = await this.database.query<Group>(query, [id]);
    return group;
  }

  async getUserById(userId: string): Promise<Users & { file_path?: string }> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users & { file_path?: string }>(
      query,
      [userId],
    );
    return user;
  }

  async getChatUser(userId: string, chatId: string): Promise<ChatUser | null> {
    const query = 'SELECT * FROM chat_users WHERE user_id =$1 AND chat_id = $2';
    const [chat] = await this.database.query<ChatUser>(query, [userId, chatId]);
    return chat;
  }

  async updateChatUser(
    id: string,
    chatUserUpdate: ChatUserUpdate,
  ): Promise<ChatUser> {
    const keys = Object.keys(chatUserUpdate);
    const values = Object.values(chatUserUpdate);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE chat_users 
    SET ${setFields} WHERE id = $${keys.length + 1} RETURNING *;`;

    const updateValues = [...values, id];

    const [updatedChatUser] = await this.database.query<ChatUser>(
      query,
      updateValues,
    );

    return updatedChatUser;
  }

  getChatTypeFilterQuery(chatFilterType: ChatTypeFilter): string {
    if (chatFilterType === ChatTypeFilter.DOCTOR) {
      return `AND users.role = 'doctor' AND chats.chat_type <> $3`;
    }

    if (chatFilterType === ChatTypeFilter.PATIENTS) {
      return `AND users.role = 'user' AND chats.chat_type <> $3`;
    }

    if (chatFilterType === ChatTypeFilter.CHANNEL) {
      return `AND chats.chat_type = $3`;
    }

    return ` `;
  }

  async getChatList(
    userId: string,
    args: GetChatListArgs,
  ): Promise<{ chatList: ChatList[]; total: number }> {
    const { limit, page, filters, search } = args;
    const offset = (page - 1) * limit;
    const isArchived = filters?.isArchived || false;
    const params = [userId, ChatType.ONE_ON_ONE, ChatType.CHANNEL, isArchived];

    const chatTypeFilterQuery = filters?.chatType
      ? this.getChatTypeFilterQuery(filters.chatType)
      : ` `;

    let commonQuery = `
      FROM chat_users AS chat_users_join
        LEFT JOIN chat_users ON chat_users_join.chat_id = chat_users.chat_id AND chat_users_join.user_id = $1
        LEFT JOIN chats ON chat_users.chat_id = chats.id
        LEFT JOIN user_channels ON chats.channel_id = user_channels.channel_id AND user_channels.user_id = $1
        ${this.getChatUserJoin()}
        ${this.getChatChannelJoin()}
        ${this.getLastMessageJoin()}
        ${this.getUnreadMessagesCountJoin()}
     WHERE chat_users_join.is_deleted = false AND chat_users_join.is_archived = $4
     AND chat_message.id IS NOT NULL
      AND (
        ( 
          chat_users.user_id <> $1 AND chats.chat_type = $2
        )
        OR ( 
          chat_users.user_id = $1 AND chats.chat_type = $3 
          )
      )
        ${chatTypeFilterQuery} 
      `;

    const searchQuery = `AND (
        (
          chats.chat_type = $2 AND
          (
            users.first_name ILIKE '%${search}%'
            OR users.last_name ILIKE '%${search}%'
            OR user_name ILIKE '%${search}%'
          )
        )
        OR
        (
          chats.chat_type = $3 AND
          channels.title ILIKE '%${search}%'
        )
      )
      `;

    if (search) {
      commonQuery += searchQuery;
    }

    const queryWithoutPagination = `
    SELECT CAST(COALESCE(COUNT(chat_users.chat_id),'0') AS INTEGER) AS total ${commonQuery}`;

    const query = `
    SELECT
      chat_users.chat_id,
      chats.chat_type,
      chats.is_disabled,
      unread_messages_count,
      chat_users.created_at,
      ROW_TO_JSON(users.*) AS user,
      ROW_TO_JSON(channels.*) AS channel,
      ROW_TO_JSON(chat_message.*) AS last_message,
      -- below fields are belongs to the user who requesting got the chat list data.
      chat_users_join.is_archived,
      chat_users_join.is_deleted
      ${commonQuery}
   ORDER BY
      COALESCE(chat_message.created_at, chat_users.created_at) DESC
      LIMIT $5 OFFSET $6`;

    const [chatList, [{ total }]] = await Promise.all([
      this.database.query<ChatList>(query, [...params, limit, offset]),
      this.database.query<{ total: number }>(queryWithoutPagination, params),
    ]);
    return { chatList, total };
  }

  async getChatByChatIdAndUserId(
    chatId: string,
    userId: string,
  ): Promise<Chat | null> {
    const query = `
    SELECT
    chats.*
  FROM
    chats
    LEFT JOIN chat_users ON chat_users.chat_id = chats.id
  WHERE
    chats.id = $1
    AND chat_users.user_id = $2`;
    const [chat] = await this.database.query<Chat>(query, [chatId, userId]);
    return chat;
  }

  async readChatMessages(chatId: string, userId: string): Promise<void> {
    const query = `UPDATE chat_messages SET is_read = $1 
    WHERE chat_messages.chat_id = $2 AND chat_messages.is_read = $3 AND chat_messages.sender_id <> $4`;
    const updateValues = [true, chatId, false, userId];
    await this.database.query(query, updateValues);
  }

  async getChatUserByChatId(
    chatId: string,
    userId: string,
  ): Promise<ChatUser | null> {
    const query = `
    SELECT
    chat_users.*
  FROM
    chats
    LEFT JOIN chat_users ON chat_users.chat_id = chats.id
  WHERE
    chats.id = $1
    AND chat_users.user_id <> $2`;
    const [chatUser] = await this.database.query<ChatUser>(query, [
      chatId,
      userId,
    ]);
    return chatUser;
  }

  async getChannelUsers(id: string): Promise<UserChannel[]> {
    const query = `SELECT user_channels.* 
    FROM user_channels 
    WHERE user_channels.is_channel_unfollowed = $1 AND user_channels.channel_id = $2 `;
    return await this.database.query<UserChannel>(query, [false, id]);
  }

  async getTreatmentById(treatmentId: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE id = $1 AND is_deleted = $2`;
    const [treatment] = await this.database.query<Treatment>(query, [
      treatmentId,
      false,
    ]);
    return treatment;
  }

  /**@description return the active/deleted treatment */
  async getTreatment(id: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE id=$1 `;
    const [treatment] = await this.database.query<Treatment>(query, [id]);
    return treatment;
  }

  async archiveAndDisableTreatmentChats(treatmentId: string): Promise<Chat> {
    const query = `
    WITH updated_chats AS (
      UPDATE chats
      SET is_disabled = $1
      WHERE treatment_id = $2
      RETURNING *
  ), updated_chat_users AS (
      UPDATE chat_users
      SET is_archived = $1
      WHERE treatment_id = $2
      RETURNING *
  )
  SELECT * FROM updated_chats;
  `;
    const [updatedChat] = await this.database.query<Chat>(query, [
      true,
      treatmentId,
    ]);
    return updatedChat;
  }

  async updateDoctorTreatmentChatDisableAndArchiveStatus(
    treatmentId: string,
    chatId: string,
    status: boolean,
  ): Promise<Chat> {
    const query = `
    WITH updated_chats AS (
      UPDATE chats 
      SET is_disabled = $1
      WHERE chats.id = $2 AND chats.treatment_id = $3 RETURNING *
  ), updated_chat_users AS (
      UPDATE chat_users 
      SET is_archived = $1
      WHERE chat_users.chat_id = $2 AND chat_users.treatment_id = $3 RETURNING *
  )
  SELECT * FROM updated_chats;
  `;

    const [updatedChat] = await this.database.query<Chat>(query, [
      status,
      chatId,
      treatmentId,
    ]);
    return updatedChat;
  }
}
