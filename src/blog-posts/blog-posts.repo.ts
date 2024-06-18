import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { UserBlogRead } from './blogs-posts.model';
import { GetBlogPostDetails } from './dto/get-blog-post-details.dto';
import { BlogPost } from './entities/blog-post.entity';

@Injectable()
export class BlogPostsRepo {
  constructor(private readonly database: Database) {}

  async saveUserBlogRead(
    userId: string,
    blogId: string,
  ): Promise<UserBlogRead> {
    const query = `INSERT INTO user_blog_reads (blog_id,user_id) VALUES('${blogId}','${userId}') RETURNING *`;
    const [userBlogRead] = await this.database.query<UserBlogRead>(query);
    return userBlogRead;
  }

  async getBlogPost(id: string): Promise<BlogPost> {
    const query = `SELECT * FROM blog_posts WHERE id=$1`;
    const [blogPost] = await this.database.query<BlogPost>(query, [id]);
    return blogPost;
  }

  async getUserBlogReadByBlogId(
    blogId: string,
    userId: string,
  ): Promise<UserBlogRead> {
    const query = `SELECT * FROM user_blog_reads WHERE blog_id=$1 AND user_id=$2`;
    const [userBlogRead] = await this.database.query<UserBlogRead>(query, [
      blogId,
      userId,
    ]);
    return userBlogRead;
  }

  async getBlogPostDetails(
    userId: string,
    blogPostId: string,
  ): Promise<GetBlogPostDetails> {
    const query = `SELECT blog_posts.*,
    ROW_TO_JSON(tool_kits.*) AS tool_kits,
    (user_blog_reads.blog_id IS NOT NULL) AS is_blog_read
    FROM blog_posts
    LEFT JOIN tool_kits ON tool_kits.id = blog_posts.tool_kit
    LEFT JOIN user_blog_reads ON user_blog_reads.blog_id = blog_posts.id AND user_blog_reads.user_id = $1
    WHERE blog_posts.id = $2
    `;
    const [blogPostDetails] = await this.database.query<GetBlogPostDetails>(
      query,
      [userId, blogPostId],
    );
    return blogPostDetails;
  }
}
