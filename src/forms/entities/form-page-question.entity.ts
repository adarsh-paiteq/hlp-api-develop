import { ObjectType, registerEnumType } from '@nestjs/graphql';

export enum PointCalculationType {
  OPTIONS_LEVEL = 'OPTIONS_LEVEL',
  QUESTION_LEVEL = 'QUESTION_LEVEL',
  NO_POINTS = 'NO_POINTS',
}

export enum QuestionType {
  SINGLE_SELECT = 'SINGLE_SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  SINGLE_SELECT_DROPDOWN_LIST = 'SINGLE_SELECT_DROPDOWN_LIST',
  ORDERED_LIST_INFO = 'ORDERED_LIST_INFO',
  NUMBER_SELECT = 'NUMBER_SELECT',
  MULTI_SELECT_BUTTONS = 'MULTI_SELECT_BUTTONS',
  SINGLE_SELECT_BUTTONS = 'SINGLE_SELECT_BUTTONS',
  MULTIPLE_SWITCHES = 'MULTIPLE_SWITCHES',
  TEXT_INPUT = 'TEXT_INPUT',
  TEXT_BOX = 'TEXT_BOX',
  DATE_PICKER_INPUT = 'DATE_PICKER_INPUT',
  MULTIPLE_ANSWERS = 'MULTIPLE_ANSWERS',
  CIRCULAR_SLIDER = 'CIRCULAR_SLIDER',
  HORIZONTAL_SLIDER = 'HORIZONTAL_SLIDER',
  MOOD_SELECTION = 'MOOD_SELECTION',
  TIME_PICKER = 'TIME_PICKER',
  DRAW_INPUT = 'DRAW_INPUT',
  NUMBER_INPUT = 'NUMBER_INPUT',
  YES_OR_NO_WITH_IMAGE = 'YES_OR_NO_WITH_IMAGE',
  RADIO_WITH_IMAGE = 'RADIO_WITH_IMAGE',
  HORIZONTAL_RADIO_BUTTONS = 'HORIZONTAL_RADIO_BUTTONS',
  INPUT_FIELDS_WITH_SIZE_CONFIGURATION = 'INPUT_FIELDS_WITH_SIZE_CONFIGURATION',
  VERTICAL_RADIO_BUTTONS = 'VERTICAL_RADIO_BUTTONS',
  GIF = 'GIF',
  YES_OR_NO = 'YES_OR_NO',
  UPLOAD_IMAGE = 'UPLOAD_IMAGE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  RANGE_IMAGE_TEXT = 'RANGE_IMAGE_TEXT',
  STEPPER = 'STEPPER',
  HABIT = 'HABIT',
  INFORMATION = 'INFORMATION',
  AUDIO = 'AUDIO',
}

registerEnumType(PointCalculationType, { name: 'PointCalculationType' });
registerEnumType(QuestionType, { name: 'QuestionType' });

@ObjectType()
export class FormPageQuestion {
  id: string;
  title: string;
  description: string;
  form: string;
  page: string;
  question_type: QuestionType;
  created_at: string;
  updated_at: string;
  points_calculation_type: PointCalculationType;
  points?: number;
  ranking?: number;
}
