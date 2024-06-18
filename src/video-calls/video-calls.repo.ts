import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { Users } from '../users/users.model';
import {
  SaveVideoCallInput,
  SaveVideoCallMemberInput,
} from './dto/generate-video-call-token.dto';
import { VideoCall, VideoCallStatus } from './entities/video-calls.entity';
import {
  VideoCallMember,
  VideoCallMemberStatus,
} from './entities/video-call-members.entity';
import { Chat, ChatType } from '@chats/entities/chat.entity';
import { Treatment } from '@treatments/entities/treatments.entity';

@Injectable()
export class VideoCallsRepo {
  constructor(private readonly database: Database) {}

  async getUserById(id: string): Promise<Users | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const [user] = await this.database.query<Users>(query, [id]);
    return user;
  }

  async insertVideoCall(input: SaveVideoCallInput): Promise<VideoCall> {
    const keys = Object.keys(input);
    const values = Object.values(input);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO video_calls (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [videoCall] = await this.database.query<VideoCall>(query, values);
    return videoCall;
  }

  async insertVideoCallMember(
    input: SaveVideoCallMemberInput,
  ): Promise<VideoCallMember> {
    const keys = Object.keys(input);
    const values = Object.values(input);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO video_call_members (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [videoCall] = await this.database.query<VideoCallMember>(
      query,
      values,
    );
    return videoCall;
  }

  async getVideoCallByRoomId(id: string): Promise<VideoCall> {
    const query = `SELECT * FROM video_calls WHERE room_id=$1 `;
    const [videoCall] = await this.database.query<VideoCall>(query, [id]);
    return videoCall;
  }

  async getChatByChatIdAndUserId(
    chatId: string,
    userId: string,
  ): Promise<(Chat & { group_title: string }) | null> {
    const query = `
    SELECT
    chats.*,
    channels.title as group_title
  FROM
    chats
    LEFT JOIN chat_users ON chat_users.chat_id = chats.id
    LEFT JOIN channels ON chats.channel_id = channels.id
  WHERE
    chats.id = $1 
    AND chats.chat_type = $2
    AND chat_users.user_id = $3`;
    const [chat] = await this.database.query<Chat & { group_title: string }>(
      query,
      [chatId, ChatType.CHANNEL, userId],
    );
    return chat;
  }

  async updateVideoCallStatus(
    id: string,
    status: VideoCallStatus,
  ): Promise<VideoCall> {
    const query = `UPDATE video_calls SET status = $2 WHERE room_id = $1 RETURNING *;`;
    const [videoCall] = await this.database.query<VideoCall>(query, [
      id,
      status,
    ]);
    return videoCall;
  }

  async updateVideoCallMemberStatus(
    userIds: string[],
    videoCallId: string,
    status: VideoCallMemberStatus,
  ): Promise<void> {
    const query = userIds
      .map((userId) => {
        return `UPDATE video_call_members SET status = '${status}' WHERE video_call_id = '${videoCallId}' AND user_id = '${userId}'; `;
      })
      .join(' ');
    await this.database.batchQuery<VideoCall>(query);
  }

  async getActiveGroupVideoCall(channelId: string): Promise<VideoCall> {
    const query = `SELECT * FROM video_calls WHERE channel_id=$1 AND (status = $2 OR status = $3);`;
    const [videoCall] = await this.database.query<VideoCall>(query, [
      channelId,
      VideoCallStatus.INITIATED,
      VideoCallStatus.ACTIVE,
    ]);
    return videoCall;
  }

  async getVideoCallMember(
    videoCallId: string,
    userId: string,
  ): Promise<VideoCallMember> {
    const query = `SELECT * FROM video_call_members WHERE video_call_id=$1 AND user_id=$2 `;
    const [videoCallMember] = await this.database.query<VideoCallMember>(
      query,
      [videoCallId, userId],
    );
    return videoCallMember;
  }

  async getTreatmentById(treatmentId: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE id = $1 AND is_deleted = $2;`;
    const [treatment] = await this.database.query<Treatment>(query, [
      treatmentId,
      false,
    ]);
    return treatment;
  }

  async getActiveOneOnOneVideoCall(chatId: string): Promise<VideoCall> {
    const query = `SELECT * FROM video_calls WHERE chat_id=$1 AND (status = $2 OR status = $3);`;
    const [videoCall] = await this.database.query<VideoCall>(query, [
      chatId,
      VideoCallStatus.INITIATED,
      VideoCallStatus.ACTIVE,
    ]);
    return videoCall;
  }
}
