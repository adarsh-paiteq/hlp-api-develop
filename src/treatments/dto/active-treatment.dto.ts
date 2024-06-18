import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActiveTreatmentResponse {
  @Field(() => Boolean)
  showDigidLogin: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'If isActive true then only token will be availabe',
  })
  token?: string;

  @Field(() => Boolean, {
    deprecationReason: 'Use showDigid instead',
  })
  isDigidSessionActive: boolean;

  @Field(() => Boolean, {
    deprecationReason: 'Use showDigid instead',
  })
  isTreatmentActive: boolean;
}
