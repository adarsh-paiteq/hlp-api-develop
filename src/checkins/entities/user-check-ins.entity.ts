import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserCheckins {
  @Field()
  id: string;
  @Field()
  user_id: string;
  @Field()
  check_in: string;
  @Field()
  updated_at: string;
  @Field()
  created_at: string;
}
