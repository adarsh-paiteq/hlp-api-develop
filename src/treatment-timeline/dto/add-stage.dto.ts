import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, Int, ObjectType, OmitType } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { StageMessageFrequency } from '../entities/stage-messages.entity';
import { StageType } from '../entities/stage.entity';
import { Type } from 'class-transformer';

@InputType()
class StageMessageTranslationInput {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  message: string;
}

@InputType()
export class StageTranslationInput {
  @Field(() => StageMessageTranslationInput)
  @Type(() => StageMessageTranslationInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  en: StageMessageTranslationInput;

  @Field(() => StageMessageTranslationInput)
  @Type(() => StageMessageTranslationInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  nl: StageMessageTranslationInput;
}

@InputType()
export class StageMessageInput {
  @Field(() => StageTranslationInput, { description: 'add translation jsonb' })
  @Type(() => StageTranslationInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  translations: StageTranslationInput;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  toolkit_id?: string;

  @Field(() => StageMessageFrequency, {
    nullable: true,
    description: `Stage Message Frequency must be ${Object.values(
      StageMessageFrequency,
    )}`,
  })
  @IsEnum(StageMessageFrequency, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  frequency?: StageMessageFrequency;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  sort_order?: number;
}

@InputType()
export class AddStageInput {
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

  @Field(() => [StageMessageInput], { nullable: false })
  @ArrayMinSize(1, { message: i18nValidationMessage('is_array_min_size') })
  @Type(() => StageMessageInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  stage_messages: StageMessageInput[];
}

export class InsertStageMessageInput extends OmitType(StageMessageInput, [
  'translations',
]) {
  translations: string;
  stage_id: string;
  created_by: string;
  updated_by: string;
}

export class InsertStageInput extends OmitType(AddStageInput, [
  'stage_messages',
]) {
  created_by: string;
  updated_by: string;
}

@ObjectType()
export class AddStageResponse {
  @Field(() => String)
  message: string;
}

export const frequencyStageType = [
  StageType.DEFAULT,
  StageType.EXPERIENCE_EXPERT,
];

export class StageInput {
  organisation_id: string;
  treatment_option_id: string;
  age_group: string[];
  stage_type: StageType;
  image_url: string;
  image_id: string;
  file_path: string;
  is_active: boolean;
}
