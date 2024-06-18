import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrganisationChannel {
  id: string;
  organisation_id: string;
  channel_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
}
