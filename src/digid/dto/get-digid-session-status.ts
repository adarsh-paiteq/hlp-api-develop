import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetDigidLoginStatusResponse {
  @Field(() => Boolean)
  status: boolean;
}
