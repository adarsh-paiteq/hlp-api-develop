import { Field, ObjectType } from '@nestjs/graphql';
import { Toolkit, ToolkitAnswers } from '../toolkits.model';
import { ToolkitGoalData } from './get-toolkit-details.dto';
import { MoodCheckCategory } from '../../user-mood-checks/entities/mood-check-category.entity';
import { MoodCheckSubCategory } from '../../user-mood-checks/entities/mood-check-sub-category.entity';

@ObjectType()
export class GetToolkitAnswerResponse {
  @Field(() => ToolkitGoalData, { nullable: true })
  goalData?: ToolkitGoalData;

  @Field(() => ToolkitAnswers)
  toolkitAnswer: ToolkitAnswers;

  @Field(() => Toolkit)
  toolkit: Toolkit;
}

export class MoodCheckCategoryAndSubCategory {
  mood_check_category: MoodCheckCategory;
  mood_check_sub_category: MoodCheckSubCategory[];
}
