import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Toolkit } from '../../toolkits/toolkits.model';
import { MembershipLevel } from '../../membership-levels/entities/membership-level.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetGroupToolArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  groupId: string;
}

@ObjectType()
export class GroupTool extends Toolkit {
  @Field(() => MembershipLevel, { nullable: true })
  membership_levels: MembershipLevel;

  @Field(() => MembershipStage, { nullable: true })
  membership_stages: MembershipStage;
}

@ObjectType()
export class GetGroupToolResponse {
  @Field(() => [GroupTool], { nullable: true })
  group_tools: GroupTool[];
}
