import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import {
  AddFlowChartRobotResponse,
  FlowChartRobotInput,
} from './add-flow-chart-robot.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class UpdateFlowChartRobotArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  id: string;
}

@ObjectType()
export class UpdateFlowChartRobotResponse extends AddFlowChartRobotResponse {}

@InputType()
export class UpdateFlowChartRobotInput extends PartialType(
  FlowChartRobotInput,
) {}
