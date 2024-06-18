import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Channel } from '../../channels/entities/channel.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetToolkitResultArgs {
  @Field()
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  date: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  scheduleId: string;
}
@ObjectType()
export class GetToolkitResultResponse {
  @Field({ nullable: true })
  gif?: string;
  @Field(() => Int, { nullable: true })
  hlp_points: number;
  @Field({ nullable: true })
  goal_level?: string;
  @Field({ nullable: true })
  goal_name?: string;
  @Field(() => Int, { nullable: true })
  targetTotal: number;
  @Field({ nullable: true })
  targetType: string;
  @Field(() => Int, { nullable: true })
  completed: number;
  @Field({ nullable: true })
  title: string;
  @Field(() => Channel, { nullable: true })
  default_channel: Channel;
}
