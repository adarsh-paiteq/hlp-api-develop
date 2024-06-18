import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  UpdateFlowChartRobotArgs,
  UpdateFlowChartRobotResponse,
} from './update-flow-chrat-robot.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetFlowChartRobotArgs extends UpdateFlowChartRobotArgs {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  startNodeId?: string;
}

@ObjectType()
export class GetFlowChartRobotResponse extends UpdateFlowChartRobotResponse {}
