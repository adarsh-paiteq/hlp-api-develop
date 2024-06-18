import {
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class TreatmentComplaint {
  id: string;
  title: string;
  is_deleted: boolean;
  @HideField()
  translations?: Translation;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
