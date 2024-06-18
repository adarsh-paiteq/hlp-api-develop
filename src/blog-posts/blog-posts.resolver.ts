import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { BlogPostsService } from './blog-posts.service';
import { SaveUserBlogReadArgs, UserBlogRead } from './blogs-posts.model';
import {
  BlogPostArgs,
  GetBlogPostDetails,
} from './dto/get-blog-post-details.dto';
import { BlogPost } from './entities/blog-post.entity';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';

@Resolver()
export class BlogPostsResolver {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserBlogRead)
  async saveUserBlogRead(
    @Args() args: SaveUserBlogReadArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<UserBlogRead> {
    return this.blogPostsService.saveUserBlogRead(args, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetBlogPostDetails, {
    name: 'getBlogPostDetails',
  })
  async getBlogPostDetails(
    @Args() args: BlogPostArgs,
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetBlogPostDetails> {
    return this.blogPostsService.getBlogPostDetails(
      user.id,
      args.blogPostId,
      lang,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => BlogPost, { name: 'getBlogPost' })
  async getBlogPost(
    @Args() args: BlogPostArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<BlogPost> {
    return this.blogPostsService.getBlogPostById(args.blogPostId, lang);
  }
}
