import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlogPostsEvent, UserBlogReadSavedEvent } from './blog-posts.event';
import { BlogPostsRepo } from './blog-posts.repo';
import { SaveUserBlogReadArgs, UserBlogRead } from './blogs-posts.model';
import { GetBlogPostDetails } from './dto/get-blog-post-details.dto';
import { BlogPost } from './entities/blog-post.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Toolkit } from '../toolkits/toolkits.model';

@Injectable()
export class BlogPostsService {
  constructor(
    private readonly blogPostsRepo: BlogPostsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}
  async saveUserBlogRead(
    args: SaveUserBlogReadArgs,
    userId: string,
  ): Promise<UserBlogRead> {
    const { blogId } = args;
    const blogPost = await this.blogPostsRepo.getBlogPost(blogId);
    if (!blogPost) {
      throw new NotFoundException();
    }
    const userBlogReadExist = await this.blogPostsRepo.getUserBlogReadByBlogId(
      blogId,
      userId,
    );
    if (userBlogReadExist) {
      throw new BadRequestException(`blog-posts.blog_already_read_by_user`);
    }
    const userBlogRead = await this.blogPostsRepo.saveUserBlogRead(
      userId,
      blogId,
    );
    this.eventEmitter.emit(
      BlogPostsEvent.USER_BLOG_READ_SAVED,
      new UserBlogReadSavedEvent(userBlogRead),
    );
    return userBlogRead;
  }

  async getBlogPostDetails(
    userId: string,
    blogPostId: string,
    lang: string,
  ): Promise<GetBlogPostDetails> {
    const blogPostDetails = await this.blogPostsRepo.getBlogPostDetails(
      userId,
      blogPostId,
    );
    if (!blogPostDetails) {
      throw new NotFoundException(`blog-posts.blog_post_not_found`);
    }
    const [translatedBlogPostDetails] =
      this.translationService.getTranslations<GetBlogPostDetails>(
        [blogPostDetails],
        ['title', 'description', 'short_description'],
        lang,
      );
    let translatedToolkits;
    if (blogPostDetails.tool_kits) {
      [translatedToolkits] = this.translationService.getTranslations<Toolkit>(
        [blogPostDetails.tool_kits],
        ['title', 'description', 'short_description'],
        lang,
      );
    }
    const translatedBlogPostWithToolkits: GetBlogPostDetails = {
      ...translatedBlogPostDetails,
      tool_kits: translatedToolkits || null,
    };
    return translatedBlogPostWithToolkits;
  }
  async getBlogPostById(blogPostId: string, lang: string): Promise<BlogPost> {
    const getBlogPost = await this.blogPostsRepo.getBlogPost(blogPostId);
    if (!getBlogPost) {
      throw new NotFoundException(`blog-posts.blog_post_not_found`);
    }
    const [translatedGetBlogPost] =
      this.translationService.getTranslations<BlogPost>(
        [getBlogPost],
        ['extra_information_description', 'extra_information_title'],
        lang,
      );
    return translatedGetBlogPost;
  }
}
