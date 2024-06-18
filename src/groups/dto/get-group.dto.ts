import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Group } from '../entities/groups.entity';
import { DeleteGroupArgs } from './delete-groups.dto';
import { Doctor } from '../../doctors/entities/doctors.entity';
import { Users } from '../../users/users.model';

@ArgsType()
export class GetGroupArgs extends DeleteGroupArgs {}

@ObjectType()
export class GetGroupResponse {
  @Field(() => Group)
  group: Group;

  @Field(() => [Doctor], { nullable: true })
  owners: Doctor[];

  @Field(() => [Users], { nullable: true })
  patients: Users[];
}
