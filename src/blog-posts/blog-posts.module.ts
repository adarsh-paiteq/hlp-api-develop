import { Module } from '@nestjs/common';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostsResolver } from './blog-posts.resolver';
import { AuthModule } from '../shared/auth/auth.module';
import { BlogPostsRepo } from './blog-posts.repo';

@Module({
  imports: [AuthModule],
  providers: [BlogPostsResolver, BlogPostsService, BlogPostsRepo],
})
export class BlogPostsModule {}
