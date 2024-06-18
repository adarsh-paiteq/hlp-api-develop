import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FormPage {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => String)
  form: string;
  @Field(() => String)
  created_at: string;
  @Field(() => String)
  updated_at: string;
}
