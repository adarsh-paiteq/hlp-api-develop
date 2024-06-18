import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum ChatType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  CHANNEL = 'CHANNEL',
}

registerEnumType(ChatType, { name: 'ChatType' });

@ObjectType()
export class Chat {
  id: string;
  chat_type: ChatType;
  @Field(() => String, { nullable: true })
  channel_id?: string;
  is_disabled: boolean;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @Field(() => String, { nullable: true })
  treatment_id?: string;
}
