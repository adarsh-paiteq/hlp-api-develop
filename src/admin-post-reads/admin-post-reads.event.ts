import { AdminPostRead } from './entities/admin-post-read.entity';

export enum AdminPostEvent {
  POST_READ = '[ADMIN POST] READ',
}

export class AdminPostReadEvent {
  constructor(public adminPostRead: AdminPostRead) {}
}
