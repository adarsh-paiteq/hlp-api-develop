import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ToolkitType } from '../toolkits.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetToolKitArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  toolkitId: string;
}

export const toolkitOptionTableInfo = {
  [ToolkitType.STEPS]: {
    tableName: 'step_tool_kit_option_selected_by_user',
    optionFieldName: 'steps_tool_kit_option_id',
  },
  [ToolkitType.SLEEP_CHECK]: {
    tableName: 'sleep_tool_kit_option_selected_by_user',
    optionFieldName: 'sleep_tool_kit_option_id',
  },
  [ToolkitType.ALCOHOL_INTAKE]: {
    tableName: 'alcohol_tool_kit_option_selected_by_user',
    optionFieldName: 'alcohol_tool_kit_option_id',
  },
  [ToolkitType.SPORT]: {
    tableName: 'sports_tool_kit_option_selected_by_user',
    optionFieldName: 'sports_tool_kit_option_id',
  },
  [ToolkitType.WEIGHT]: {
    tableName: 'weight_tool_kit_option_selected_by_user',
    optionFieldName: 'weight',
  },
  [ToolkitType.MEDICATION]: {
    tableName: 'medication_tool_kit_info_planned_by_user',
    optionFieldName: 'doses',
  },
};
