import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  ObjectType,
} from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class HabitToolEndDateArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  tool_kit_id: string;

  @IsDateString()
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  current_date: string;
}

@ObjectType()
export class HabitToolEndDateOutput {
  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate: Date;
}
