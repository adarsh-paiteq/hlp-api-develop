import { Injectable } from '@nestjs/common';
import { ChannelPost } from '../channels/channels.dto';
import { Database } from '../core/modules/database/database.service';
import { AdminPostRead } from './entities/admin-post-read.entity';

@Injectable()
export class AdminPostReadsRepo {
  constructor(private readonly database: Database) {}

  async readAdminPost(userId: string, postId: string): Promise<AdminPostRead> {
    const query = `INSERT INTO admin_post_reads (user_id,admin_post_id) VALUES ($1,$2) RETURNING * `;
    const [adminPostRead] = await this.database.query<AdminPostRead>(query, [
      userId,
      postId,
    ]);
    return adminPostRead;
  }

  async getAdminPostRead(
    userId: string,
    postId: string,
  ): Promise<AdminPostRead> {
    const query = `SELECT * FROM admin_post_reads WHERE user_id=$1 AND admin_post_id=$2`;
    const [adminPostRead] = await this.database.query<AdminPostRead>(query, [
      userId,
      postId,
    ]);
    return adminPostRead;
  }

  async getChannelPost(postId: string): Promise<ChannelPost> {
    const query = `SELECT * FROM channel_user_posts WHERE id=$1`;
    const [channelPost] = await this.database.query<ChannelPost>(query, [
      postId,
    ]);
    return channelPost;
  }
}
