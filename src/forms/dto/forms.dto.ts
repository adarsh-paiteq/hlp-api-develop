import { OmitType } from '@nestjs/graphql';
import { QuestionType } from '../entities/form-page-question.entity';
import { FormPage } from '../entities/form-page.entity';
import { Form } from '../entities/form.entity';
import { PageQuestions } from './get-form-page-questions.dto';

export class FormWithPages {
  form: Form;
  pages: FormPage[];
}

export const questionOptionsTableNames = new Map<QuestionType, string>([
  [QuestionType.STEPPER, 'stepper_options'],
  [QuestionType.MOOD_SELECTION, 'mood_select_options'],
  [QuestionType.INPUT_FIELDS_WITH_SIZE_CONFIGURATION, 'input_fields_options'],
  [QuestionType.YES_OR_NO, 'yes_no_select_options'],
  [QuestionType.SINGLE_SELECT, 'single_select_options'],
  [QuestionType.NUMBER_SELECT, 'number_select_options'],
  [QuestionType.MULTI_SELECT, 'multiple_select_options'],
  [QuestionType.ORDERED_LIST_INFO, 'ordered_list_info_options'],
  [QuestionType.RANGE_IMAGE_TEXT, 'range_image_text_select_options'],
  [QuestionType.RADIO_WITH_IMAGE, 'radio_with_image_select_options'],
  [QuestionType.CIRCULAR_SLIDER, 'circular_slider'],
  [QuestionType.HORIZONTAL_RADIO_BUTTONS, 'horizontal_radio_buttons'],
  [QuestionType.HORIZONTAL_SLIDER, 'horizontal_slider'],
  [QuestionType.INFORMATION, 'information_question_details'],
  [QuestionType.MULTI_SELECT_BUTTONS, 'multiple_select_buttons'],
  [QuestionType.MULTIPLE_SWITCHES, 'multiple_switches'],
  [QuestionType.AUDIO, 'question_audios'],
  [QuestionType.IMAGE, 'question_images'],
  [QuestionType.VIDEO, 'question_videos'],
  [QuestionType.SINGLE_SELECT_BUTTONS, 'single_select_buttons'],
  [QuestionType.SINGLE_SELECT_DROPDOWN_LIST, 'single_select_dropdown'],
  [QuestionType.VERTICAL_RADIO_BUTTONS, 'vertical_radio_buttons'],
]);

export const questionOptionsTableNamesForCaseQuery = new Map<
  QuestionType,
  string
>([
  [QuestionType.STEPPER, 'stepper_options'],
  [QuestionType.MOOD_SELECTION, 'mood_select_options'],
  [QuestionType.INPUT_FIELDS_WITH_SIZE_CONFIGURATION, 'input_fields_options'],
  [QuestionType.YES_OR_NO, 'yes_no_select_options'],
  [QuestionType.SINGLE_SELECT, 'single_select_options'],
  [QuestionType.NUMBER_SELECT, 'number_select_options'],
  [QuestionType.MULTI_SELECT, 'multiple_select_options'],
  [QuestionType.ORDERED_LIST_INFO, 'ordered_list_info_options'],
  [QuestionType.RANGE_IMAGE_TEXT, 'range_image_text_select_options'],
  [QuestionType.RADIO_WITH_IMAGE, 'radio_with_image_select_options'],
  [QuestionType.CIRCULAR_SLIDER, 'circular_slider'],
  [QuestionType.HORIZONTAL_RADIO_BUTTONS, 'horizontal_radio_buttons'],
  [QuestionType.HORIZONTAL_SLIDER, 'horizontal_slider'],
  [QuestionType.INFORMATION, 'information_question_details'],
  [QuestionType.MULTI_SELECT_BUTTONS, 'multiple_select_buttons'],
  [QuestionType.MULTIPLE_SWITCHES, 'multiple_switches'],
  [QuestionType.SINGLE_SELECT_BUTTONS, 'single_select_buttons'],
  [QuestionType.SINGLE_SELECT_DROPDOWN_LIST, 'single_select_dropdown'],
  [QuestionType.VERTICAL_RADIO_BUTTONS, 'vertical_radio_buttons'],
  [QuestionType.YES_OR_NO_WITH_IMAGE, 'yes_no_select_options'],
]);

export const questionAnswersTableNames = new Map<QuestionType, string>([
  [QuestionType.AUDIO, 'audio_question_answers'],
  [QuestionType.CIRCULAR_SLIDER, 'circular_slider_question_answers'],
  [
    QuestionType.INPUT_FIELDS_WITH_SIZE_CONFIGURATION,
    'custom_input_fields_question_answers',
  ],
  [QuestionType.DATE_PICKER_INPUT, 'date_picker_input_question_answers'],

  [QuestionType.DRAW_INPUT, 'draw_input_question_answers'],
  [
    QuestionType.HORIZONTAL_RADIO_BUTTONS,
    'horizontal_radio_buttons_question_answers',
  ],
  [QuestionType.HORIZONTAL_SLIDER, 'horizontal_slider_question_answers'],
  [QuestionType.MOOD_SELECTION, 'mood_selection_question_answers'],
  [QuestionType.MULTIPLE_ANSWERS, 'multiple_answers_question_answers'],
  [
    QuestionType.MULTI_SELECT_BUTTONS,
    'multiple_select_buttons_question_answers',
  ],
  [QuestionType.MULTI_SELECT, 'multiple_select_checkbox_question_answers'],
  [
    QuestionType.MULTIPLE_SWITCHES,
    'multiple_switches_selection_question_answers',
  ],
  [QuestionType.NUMBER_INPUT, 'number_input_question_answers'],
  [QuestionType.NUMBER_SELECT, 'number_select_question_answers'],
  [QuestionType.RADIO_WITH_IMAGE, 'radio_with_image_question_answers'],
  [QuestionType.RANGE_IMAGE_TEXT, 'range_image_text_question_answers'],
  [
    QuestionType.SINGLE_SELECT_BUTTONS,
    'single_select_buttons_question_answers',
  ],
  [
    QuestionType.SINGLE_SELECT_DROPDOWN_LIST,
    'single_select_dropdown_question_answers',
  ],
  [QuestionType.SINGLE_SELECT, 'single_select_question_answers'],
  [QuestionType.STEPPER, 'stepper_question_answers'],
  [QuestionType.TEXT_BOX, 'text_box_input_question_answers'],
  [QuestionType.TEXT_INPUT, 'text_input_question_answers'],
  [QuestionType.TIME_PICKER, 'time_picker_input_question_answers'],
  [QuestionType.UPLOAD_IMAGE, 'upload_image_question_answers'],
  [QuestionType.VERTICAL_RADIO_BUTTONS, 'vertical_radio_question_answers'],
  [QuestionType.YES_OR_NO, 'yes_or_no_question_answers'],
  [QuestionType.YES_OR_NO_WITH_IMAGE, 'yes_or_no_with_image_question_answers'],
]);

export class SaveFormPagePoints {
  user_id: string;
  form_id: string;
  page_id: string;
  session_id: string;
  calculated_points: number;
}

export class PageQuestionsDto extends OmitType(PageQuestions, [
  'validations',
]) {}
