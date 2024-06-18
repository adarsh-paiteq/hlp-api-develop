import { OmitType } from '@nestjs/mapped-types';
import { FlowChartRobot } from '../entities/flow-chart-robot.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { RobotButtonAction, RobotType } from '../entities/robot.entity';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class FlowChartRobotButtonInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  label: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEnum(RobotButtonAction, { message: i18nValidationMessage('is_enum') })
  action: RobotButtonAction;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @ValidateIf((obj) => obj.action === RobotButtonAction.navigate)
  @Field(() => String, { nullable: true })
  robot_id?: string;
}

@InputType()
export class FlowChartRobotInput extends OmitType(FlowChartRobot, [
  'id',
  'created_at',
  'updated_at',
]) {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  title: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  body: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  robot_image_file_path: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  robot_image_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  robot_image_url: string;

  @Field(() => RobotType, { defaultValue: RobotType.FLOW_CHART })
  //   @IsNotEmpty()
  @IsEnum(RobotType, { message: i18nValidationMessage('is_enum') })
  type: RobotType;

  @Field()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  is_start_node: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @ValidateNested({ each: true })
  @Type(() => FlowChartRobotButtonInput)
  @Field(() => [FlowChartRobotButtonInput], {
    nullable: true,
    defaultValue: [],
  })
  buttons: FlowChartRobotButtonInput[];
}

@ObjectType()
export class AddFlowChartRobot {
  @Field(() => FlowChartRobotInput)
  robot: FlowChartRobotInput;
}

@ObjectType()
export class AddFlowChartRobotResponse {
  @Field(() => FlowChartRobot)
  robot?: FlowChartRobot;
}
