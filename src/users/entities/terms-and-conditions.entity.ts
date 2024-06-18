import {
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class TermAndCondition {
  id: string;
  terms_and_condition_info: string;

  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @HideField()
  translations?: Translation;
}
