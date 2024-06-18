import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Toolkit } from '../../toolkits/toolkits.model';
import { Challenge } from '../challenges.model';
import { UserChallenge } from '../entities/user-challenge.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetChallengeInfoArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  challengeId: string;
}

@ObjectType()
export class GetChallengeInfoResponse extends Challenge {
  @Field(() => Toolkit)
  tool_kit: Toolkit;

  @Field(() => [UserChallenge], { nullable: 'items' })
  user_challenges: UserChallenge[];
}
