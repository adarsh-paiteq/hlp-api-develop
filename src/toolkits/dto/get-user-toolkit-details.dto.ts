import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  GetToolkitArgs,
  GetToolkitDetailsResponse,
} from './get-toolkit-details.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetUserToolkitArgs extends GetToolkitArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  user_id: string;
}

@ObjectType()
export class GetUserToolkitDetailsResponse extends GetToolkitDetailsResponse {}
