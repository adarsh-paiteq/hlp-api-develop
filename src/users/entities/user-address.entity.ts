import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserAddress {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  first_name: string;
  last_name: string;
  @Field(() => String, {
    nullable: true,
    deprecationReason: 'added hometown field',
  })
  city?: string;
  postal_code: string;
  street_address: string;
  @Field(() => String, { nullable: true })
  mobile_number?: string;
  @Field(() => String, { nullable: true })
  street_address1?: string;
  middle_name?: string;
  hometown?: string;
  house_number?: string;
  house_addition?: string;
}
