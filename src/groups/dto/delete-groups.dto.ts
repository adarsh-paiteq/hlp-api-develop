import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CreateGroupOutput } from './create-groups.dto';
import { Group } from '../entities/groups.entity';

@ArgsType()
export class DeleteGroupArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  groupId: string;
}

@ObjectType()
export class DeleteGroupResponse extends CreateGroupOutput {}

export class GroupUpdateDto extends PartialType(Group) {}
