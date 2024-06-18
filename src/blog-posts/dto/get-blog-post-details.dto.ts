import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Toolkit } from '../../toolkits/toolkits.model';
import { BlogPost } from '../entities/blog-post.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class BlogPostArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  blogPostId: string;
}

@ObjectType()
export class GetBlogPostDetails extends BlogPost {
  @Field(() => Toolkit, { nullable: true })
  tool_kits: Toolkit | null;
  @Field(() => Boolean)
  is_blog_read: boolean;
}
