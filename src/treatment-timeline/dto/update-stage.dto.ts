import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { AddStageInput, StageMessageInput } from './add-stage.dto';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Stage, StageType } from '../entities/stage.entity';
import { Type } from 'class-transformer';

@InputType()
export class UpdateStageMessageInput extends StageMessageInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  stage_message_id?: string;
}
@InputType()
export class UpdateStage {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  organisation_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @ValidateIf((obj: AddStageInput) => obj.stage_type !== StageType.GROUP)
  @Field(() => String, { nullable: true })
  treatment_option_id: string;

  @Field(() => [String], { nullable: true })
  @ValidateIf((obj: AddStageInput) => obj.stage_type !== StageType.GROUP)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string'), each: true })
  @ArrayMinSize(1, { message: i18nValidationMessage('is_array_min_size') })
  @IsArray()
  age_group: string[];

  @IsEnum(StageType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => StageType, {
    nullable: false,
    description: `Stage Type must be ${Object.values(StageType)}`,
  })
  stage_type: StageType;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  image_url: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  image_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  file_path: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  is_active: boolean;

  @Field(() => [UpdateStageMessageInput], { nullable: false })
  @ArrayMinSize(1, { message: i18nValidationMessage('is_array_min_size') })
  @Type(() => UpdateStageMessageInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  stage_messages: UpdateStageMessageInput[];
}

@InputType()
export class UpdateStageInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  stageId: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Field(() => UpdateStage)
  stage: UpdateStage;
}

export class UpdateStageDTO extends OmitType(UpdateStage, ['stage_messages']) {
  updated_by: string;
}

@ObjectType()
export class UpdateStageResponse {
  @Field(() => String)
  message: string;
}

export class UpdateStageMessagesInput extends OmitType(StageMessageInput, [
  'translations',
  'frequency',
]) {
  translations: string;
  stage_id: string;
  updated_by: string;
}
export class StageUpdateDto extends PartialType(Stage) {}
