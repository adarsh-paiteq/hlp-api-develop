import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  GetTreatmentTimelineResponse,
  TreatementTimelineFilter,
} from './get-treatment-timeline.dto';

@InputType()
export class GetUserTreatmentTimelineInput {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  treatment_id?: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  user_id: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => TreatementTimelineFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @Field(() => TreatementTimelineFilter, { nullable: true })
  filters?: TreatementTimelineFilter;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => Int, {
    nullable: true,
    defaultValue: 30,
    description: 'default value is 30',
  })
  limit = 30;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'default value is 1',
  })
  page = 1;
}

@ObjectType()
export class GetUserTreatmentTimelineResponse extends GetTreatmentTimelineResponse {}
