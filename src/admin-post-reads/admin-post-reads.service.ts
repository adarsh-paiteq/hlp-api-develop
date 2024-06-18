import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRoles } from '../users/users.dto';
import { AdminPostEvent, AdminPostReadEvent } from './admin-post-reads.event';
import { AdminPostReadsRepo } from './admin-post-reads.repo';
import { AdminPostRead } from './entities/admin-post-read.entity';

@Injectable()
export class AdminPostReadsService {
  constructor(
    private readonly adminPostReadsRepo: AdminPostReadsRepo,
    private readonly eventemitter: EventEmitter2,
  ) {}
  async adminPostRead(userId: string, postId: string): Promise<AdminPostRead> {
    const post = await this.adminPostReadsRepo.getChannelPost(postId);
    if (!post) {
      throw new NotFoundException(`admin-post-reads.channel_post_not_found`);
    }
    if (post.added_by !== UserRoles.ADMIN) {
      throw new BadRequestException(`admin-post-reads.invalid_post`);
    }
    const isPostAlreadyRead = await this.adminPostReadsRepo.getAdminPostRead(
      userId,
      postId,
    );
    if (isPostAlreadyRead) {
      throw new ConflictException(`admin-post-reads.already_read_post`);
    }
    const adminPostRead = await this.adminPostReadsRepo.readAdminPost(
      userId,
      postId,
    );
    this.eventemitter.emit(
      AdminPostEvent.POST_READ,
      new AdminPostReadEvent(adminPostRead),
    );
    return adminPostRead;
  }
}
