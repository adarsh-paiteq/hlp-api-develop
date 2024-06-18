import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { SupportVideosCategory } from '../entities/support-video-category.entity';
import { SupportVideos } from '../entities/support-videos.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
@ArgsType()
export class SupportVideoDetailsArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  videoId: string;
}

@ObjectType()
export class SupportVideosDetail extends SupportVideos {
  @Field(() => SupportVideosCategory)
  support_video_category: SupportVideosCategory;
}

@ObjectType()
export class SupportVideoCategory extends SupportVideosCategory {
  @Field(() => [SupportVideos], { nullable: 'items' })
  support_videos: SupportVideos[];
}
