import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { UpdateFlowChartRobotArgs } from './update-flow-chrat-robot.dto';

@ObjectType()
export class AddFlowChartRobotLogResponse {
  @Field(() => String)
  message: string;
}

@ArgsType()
export class AddFlowChartRobotLogArgs extends UpdateFlowChartRobotArgs {}
