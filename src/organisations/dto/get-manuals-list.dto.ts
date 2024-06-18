import { Field, ObjectType } from '@nestjs/graphql';
import { Manual } from '../entities/manuals.entity';
@ObjectType()
export class GetManualList {
  @Field(() => [Manual], { nullable: true })
  manuals: Manual[];
}
