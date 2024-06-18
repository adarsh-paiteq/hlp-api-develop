import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { Toolkit, ToolkitType } from '../../toolkits/toolkits.model';
import { Checkin } from '../entities/check-ins.entity';
import { UserCheckins } from '../entities/user-check-ins.entity';

@ArgsType()
export class GetCheckinsHistoryArgs {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string;
}

@ObjectType()
export class GetCheckinsHistoryResponse {
  @Field(() => [CheckinWithToolkitType], { nullable: 'items' })
  checkins: CheckinWithToolkitType[];
}

@ObjectType()
export class CheckinWithToolkitType extends Checkin {
  @Field(() => ToolkitType)
  tool_kit_type: ToolkitType;
}

@ObjectType()
export class GetCheckInsListWithUserCheckInStatusRes extends Checkin {
  @Field(() => Toolkit)
  tool_kit: Toolkit;

  @Field(() => [UserCheckins], { nullable: 'items' })
  user_check_ins: UserCheckins[];
}
