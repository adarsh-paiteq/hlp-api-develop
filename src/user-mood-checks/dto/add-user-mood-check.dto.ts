import { ArgsType, Field } from '@nestjs/graphql';
import { OmitType, PickType } from '@nestjs/mapped-types';
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { UserMoodCheck } from '../entities/user-mood-check.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class AssUserMoodCheckArgs extends PickType(UserMoodCheck, [
  'category_id',
  'sub_category_ids',
]) {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  category_id: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @ArrayMinSize(1)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsArray()
  @Field(() => [String], { nullable: false })
  sub_category_ids: string[];
}

export class UserMoodCheckDto extends OmitType(UserMoodCheck, [
  'created_at',
  'updated_at',
  'date',
  'id',
]) {
  date: string;
}
