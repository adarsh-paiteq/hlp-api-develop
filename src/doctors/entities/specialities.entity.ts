import {
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Speciality {
  id: string;
  title: string;
  is_deleted: boolean;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @HideField()
  translations?: Translation;
}
