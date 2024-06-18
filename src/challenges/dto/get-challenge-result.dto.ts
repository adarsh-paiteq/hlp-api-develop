import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Channel } from '../.././channels/entities/channel.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetChallengeResultArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  date: string;
}

@ObjectType()
export class GetChallengeResultResponse {
  @Field(() => String, { nullable: true })
  challenge_title: string;
  @Field(() => String, { nullable: true })
  challenge_gif?: string;
  @Field(() => Int, { nullable: true })
  hlp_points: number;
  @Field(() => Int)
  total_hlp_points: number;
  @Field(() => Int)
  level: number;
  @Field(() => String, { nullable: true })
  targetType: string;
  @Field(() => Int, { nullable: true })
  targetTotal: number;
  @Field(() => Int, { nullable: true })
  completed: number;
  @Field(() => Int)
  ranking: number;
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
  @Field(() => Channel, { nullable: true })
  default_channel: Channel;
}
