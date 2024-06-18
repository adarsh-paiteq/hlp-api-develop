import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { RobotButtonAction, RobotType } from './robot.entity';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class FlowChartRobotButton {
  @Field()
  label: string;

  @Field()
  action: RobotButtonAction;

  @Field()
  robot_id?: string;
}

@ObjectType()
export class FlowChartRobot {
  id: string;

  title: string;

  body: string;

  robot_image_file_path: string;

  robot_image_id: string;

  robot_image_url: string;

  type: RobotType;

  is_start_node: boolean;

  buttons: FlowChartRobotButton[];
  created_at: Date;
  updated_at: Date;
  @HideField()
  translations?: Translation;
}
