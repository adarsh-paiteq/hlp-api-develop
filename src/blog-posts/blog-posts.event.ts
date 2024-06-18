import { UserBlogRead } from './blogs-posts.model';

export enum BlogPostsEvent {
  USER_BLOG_READ_SAVED = '[BLOGS POSTS] USER BLOG READ SAVED',
}

export class UserBlogReadSavedEvent {
  constructor(public userBlogRead: UserBlogRead) {}
}
