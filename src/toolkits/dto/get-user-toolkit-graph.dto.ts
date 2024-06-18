import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  GetToolkitGraphArgs,
  GetToolkitGraphResponse,
} from '@toolkits/toolkits.model';

@ArgsType()
export class GetUserToolkitGraphArgs extends GetToolkitGraphArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserToolkitGraphResponse extends GetToolkitGraphResponse {}
