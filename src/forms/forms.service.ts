import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FormsRepo } from './forms.repo';
import { v4 as uuidv4 } from 'uuid';
import { GetFormInfoResponse } from './dto/get-form-info.dto';
import {
  CommonQuestionOption,
  GetFormQuestionsResponse,
  PageQuestions,
  PageQuestionsWithOptionsDto,
  QuestionOptionsWithStatus,
} from './dto/get-form-page-questions.dto';

import {
  FormQuestionAnswers,
  QuestionAnswers,
  SaveFormPageQuestionAnswersInput,
  SaveFormPageQuestionAnswersResponse,
  SaveFormQuestionAnswers,
} from './dto/save-form-page-question-answers.dto';
import { SaveFormPagePoints } from './dto/forms.dto';
import {
  PointCalculationType,
  QuestionType,
} from './entities/form-page-question.entity';
import {
  SaveUserFormAnswerDto,
  SaveUserFormAnswerInput,
  SaveUserFormAnswerResponse,
} from './dto/save-user-form-answers.dto';
import {
  FormHistoryQuestionAnswers,
  GetFormHistoryArgs,
  GetFormHistoryResponse,
  PageQuestionAnswers,
  PageQuestionAnswersDto,
} from './dto/get-form-history.dto';
import { FormPage } from './entities/form-page.entity';
import { FormResultResponse } from './dto/get-form-result.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FormsEvent, UserFormAnswerEvent } from './forms.event';
import { Form } from './entities/form.entity';
import { ToolkitEpisode } from '../toolkits/entities/toolkit-episode.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Toolkit } from '@toolkits/toolkits.model';
import { FormSubmitPageInfo } from './entities/form-submit-page-info.entity';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import {
  AppointmentFormQuestionInsight,
  FormInsightType,
  FormQuestionAndAnswersWithDate,
  GetAppointmentFormsInsightArgs,
  GetAppointmentFormsInsightResponse,
  AppointmentFormInsight,
} from './dto/get-appointment-form-insight.dto';
import { EnvVariable } from '@core/configs/config';
import { ConfigService } from '@nestjs/config';
import { UtilsService } from '@utils/utils.service';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);
  constructor(
    private readonly formsRepo: FormsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
    private readonly configService: ConfigService,
    private readonly utilService: UtilsService,
  ) {}

  async getFormInfo(
    lang: string,
    toolkitId?: string,
    formId?: string,
  ): Promise<GetFormInfoResponse> {
    let formWithPages;
    if ((toolkitId && !formId) || (toolkitId && formId)) {
      formWithPages = await this.formsRepo.getFormWithPagesByToolkitId(
        toolkitId,
        formId,
      );
    }
    if (!toolkitId && formId) {
      formWithPages = await this.formsRepo.getFormWithPagesByFormId(formId);
    }

    if (!formWithPages) {
      throw new NotFoundException(`forms.form_not_found`);
    }
    const { form, pages } = formWithPages;
    const pageId = pages.find((page) => page !== undefined);
    const [translatedForm] = this.translationService.getTranslations<Form>(
      [form],
      ['title', 'description'],
      lang,
    );
    const formInfo: GetFormInfoResponse = {
      form: translatedForm,
      pageId: pageId?.id,
      totalPages: pages.length,
      sessionId: uuidv4(),
    };
    return formInfo;
  }

  /**
   * @description added is_selected false to make same types for options in history and get questions query
   */
  getMappedQuestionsWithOptions(
    pageQuestions: PageQuestionsWithOptionsDto[],
  ): PageQuestions[] {
    return pageQuestions.map((question) => {
      const mappedOptions: QuestionOptionsWithStatus[] = question.options.map(
        (option) => {
          return { ...option, is_selected: false };
        },
      );

      return {
        ...question,
        options: mappedOptions,
      };
    });
  }

  async getFormPageQuestions(
    formId: string,
    pageId: string,
  ): Promise<GetFormQuestionsResponse> {
    const [form, formPage] = await Promise.all([
      this.formsRepo.getFormByFormId(formId),
      this.formsRepo.getFormPageByPageId(pageId),
    ]);
    if (!form || !formPage) {
      throw new NotFoundException(`forms.form_or_page_not_found`);
    }
    const [pageQuestions, nextPageId] = await Promise.all([
      this.formsRepo.getPageQuestionsWithOptions(formId, pageId),
      this.formsRepo.getNextPageId(formId, pageId),
    ]);
    const mappedPageQuestions =
      this.getMappedQuestionsWithOptions(pageQuestions);

    return { formPage, pageQuestions: mappedPageQuestions, nextPageId };
  }

  async getFormPageQuestionsPoints(
    input: SaveFormPageQuestionAnswersInput,
    formQuestionAnswers: FormQuestionAnswers[],
  ): Promise<number> {
    const { form_id: formId, page_id: pageId } = input;
    const questionIds = formQuestionAnswers.map((answer) => answer.question_id);
    const questions = await this.formsRepo.getFormPageQuestionsByQuestionIds(
      formId,
      pageId,
      questionIds,
    );
    let points = 0;
    if (!questions.length) {
      return points;
    }

    questions.map((questionData) => {
      const { options, question } = questionData;
      const questionAnswer = formQuestionAnswers.find(
        (answer) => answer.question_id === question.id,
      );
      if (!questionAnswer) {
        return;
      }

      if (
        question.points_calculation_type === PointCalculationType.QUESTION_LEVEL
      ) {
        points += question.points || 0;
        return;
      }

      if (
        question.points_calculation_type === PointCalculationType.OPTIONS_LEVEL
      ) {
        if (question.question_type === QuestionType.CIRCULAR_SLIDER) {
          for (const option of options) {
            if ('starting_angle' in option && 'answer' in questionAnswer) {
              const { starting_angle, maximum_angle } = option;
              const { answer } = questionAnswer;
              if (
                Number(answer) >= starting_angle &&
                Number(answer) <= maximum_angle
              ) {
                points += option.points || 0;
                return;
              }
            }
          }
        }

        if (question.question_type === QuestionType.HORIZONTAL_SLIDER) {
          for (const option of options) {
            if ('starting_value' in option && 'answer' in questionAnswer) {
              const { starting_value, maximum_value } = option;
              const { answer } = questionAnswer;
              if (
                Number(answer) >= starting_value &&
                Number(answer) <= maximum_value
              ) {
                points += option.points || 0;
                return;
              }
            }
          }
        }

        if ('option_id' in questionAnswer) {
          const selectedOption = options.find(
            (option) => option.id === questionAnswer.option_id,
          );
          if (!selectedOption) {
            return;
          }

          if ('points' in selectedOption) {
            points += selectedOption.points || 0;
            return;
          }
        }
        if ('answer' in questionAnswer) {
          const selectedOption = options.find(
            (option) => option.id === questionAnswer.answer,
          );
          if (!selectedOption) {
            return;
          }
          if ('points' in selectedOption) {
            points += selectedOption.points || 0;
            return;
          }
        }
      }
    });
    return points;
  }

  async deleteAndInsertFormPageQuestionAnswers(
    answers: SaveFormQuestionAnswers[],
    input: SaveFormPageQuestionAnswersInput,
    userId: string,
  ): Promise<SaveFormPageQuestionAnswersResponse> {
    const formQuestionAnswers =
      await this.formsRepo.deleteAndInsertFormPageQuestionAnswers(
        answers,
        input,
        userId,
      );

    if (!formQuestionAnswers.length) {
      return {
        response: `${
          formQuestionAnswers.length
        } ${this.translationService.translate('forms.rows_affected')}`,
      };
    }

    const { form_id, page_id, session_id } = input;
    const earnedPoints = await this.getFormPageQuestionsPoints(
      input,
      formQuestionAnswers,
    );

    const formPagePointsDetails = await this.formsRepo.getFormPagePointsDetails(
      userId,
      form_id,
      page_id,
      session_id,
    );
    if (formPagePointsDetails) {
      const updatedFormPagePoints = await this.formsRepo.updateFormPagePoints(
        formPagePointsDetails.id,
        earnedPoints,
      );
      this.logger.log(updatedFormPagePoints);
      return {
        response: `${
          formQuestionAnswers.length
        } ${this.translationService.translate('forms.rows_affected')}`,
      };
    }

    const saveFormPagePoints: SaveFormPagePoints = {
      calculated_points: earnedPoints,
      form_id,
      page_id,
      session_id,
      user_id: userId,
    };
    const formPagePoints = await this.formsRepo.saveFormPagePoints(
      saveFormPagePoints,
    );
    this.logger.log(formPagePoints);

    return {
      response: `${
        formQuestionAnswers.length
      } ${this.translationService.translate('forms.rows_affected')}`,
    };
  }

  getMappedFormQuestionAnswers(
    questionAnswers: QuestionAnswers,
    input: SaveFormPageQuestionAnswersInput,
    userId: string,
  ): SaveFormQuestionAnswers[] {
    const {
      form_id,
      page_id,
      schedule_id,
      session_id,
      session_date,
      session_time,
    } = input;
    const answers: SaveFormQuestionAnswers[] = Object.values(questionAnswers)
      .flat()
      .map((questionAnswer) => ({
        ...questionAnswer,
        user_id: userId,
        form_id,
        page_id,
        schedule_id,
        session_id,
        session_date,
        session_time,
      }));
    // if (!answers.length) {
    //   throw new BadRequestException(`forms.no_data_provided`);
    // }
    return answers;
  }

  async validateSaveFormPageQuestionsAnswersInput(
    userId: string,
    input: SaveFormPageQuestionAnswersInput,
  ): Promise<void> {
    const {
      form_id: formId,
      page_id: pageId,
      schedule_id: scheduleId,
      session_date: date,
    } = input;

    const [user, form, formPage, schedule] = await Promise.all([
      this.formsRepo.getUserById(userId),
      this.formsRepo.getFormByFormId(formId),
      this.formsRepo.getFormPageByPageId(pageId),
      this.formsRepo.getUserSchedule(scheduleId, userId, date),
    ]);
    if (!user) {
      throw new NotFoundException(`forms.user_not_found`);
    }
    if (!form) {
      throw new NotFoundException(`forms.form_not_found`);
    }
    if (!formPage) {
      throw new NotFoundException(`forms.form_or_page_not_found`);
    }
    if (!schedule) {
      throw new NotFoundException('forms.user_schedule_found');
    }
  }

  async validatePageAnswerQuestions(
    mappedAnswers: SaveFormQuestionAnswers[],
    pageQuestions: PageQuestionsWithOptionsDto[],
  ): Promise<void> {
    const invalidQuestions: {
      question_id: string;
      question_type: QuestionType;
    }[] = [];

    mappedAnswers.forEach(({ question_id, question_type }) => {
      if (
        !pageQuestions.some(
          ({ question }) =>
            question.id === question_id &&
            question.question_type === question_type,
        )
      ) {
        invalidQuestions.push({ question_id, question_type });
      }
    });

    if (invalidQuestions.length) {
      throw new BadRequestException(
        `${this.translationService.translate(
          'forms.the_answers_contain_invalid_questions',
        )} ${JSON.stringify(invalidQuestions)}.`,
      );
    }
  }

  async saveFormPageQuestionAnswers(
    input: SaveFormPageQuestionAnswersInput,
    userId: string,
  ): Promise<SaveFormPageQuestionAnswersResponse> {
    const { question_answers: questionAnswers, form_id, page_id } = input;

    await this.validateSaveFormPageQuestionsAnswersInput(userId, input);
    const mappedAnswers = this.getMappedFormQuestionAnswers(
      questionAnswers,
      input,
      userId,
    );

    const pageQuestions = await this.formsRepo.getPageQuestionsWithOptions(
      form_id,
      page_id,
    );
    if (!pageQuestions.length) {
      throw new NotFoundException(`forms.form_page_has_not_questions`);
    }
    await this.validatePageAnswerQuestions(mappedAnswers, pageQuestions);
    return this.deleteAndInsertFormPageQuestionAnswers(
      mappedAnswers,
      input,
      userId,
    );
  }

  async validateSaveFormAnswersInput(
    input: SaveUserFormAnswerInput,
  ): Promise<void> {
    const {
      episode_id: episodeId,
      tool_kit_id: toolkitId,
      user_appointment_id,
      appointment_session_id,
    } = input;
    if (episodeId && !toolkitId) {
      throw new BadRequestException(`forms.tool_kit_id_required`);
    }
    if (episodeId && toolkitId && user_appointment_id) {
      throw new BadRequestException(`forms.user_appointment_id_not_required`);
    }
    if (toolkitId && user_appointment_id) {
      throw new BadRequestException(
        `forms.select_tool_kit_id_or_user_appointment_id`,
      );
    }
    if (!toolkitId && !user_appointment_id) {
      throw new BadRequestException(
        `forms.select_tool_kit_id_or_user_appointment_id`,
      );
    }
    if (toolkitId && appointment_session_id) {
      throw new BadRequestException(
        `forms.user_appointment_session_id_not_required`,
      );
    }
    if (episodeId && toolkitId && appointment_session_id) {
      throw new BadRequestException(
        `forms.user_appointment_session_id_not_required`,
      );
    }
    if (!user_appointment_id && appointment_session_id) {
      throw new BadRequestException(
        `forms.user_appointment_session_id_not_required`,
      );
    }
    if (user_appointment_id && !appointment_session_id) {
      throw new BadRequestException(
        `forms.user_appointment_session_id_required`,
      );
    }
  }

  async saveUserFormAnswers(
    input: SaveUserFormAnswerInput,
    userId: string,
  ): Promise<SaveUserFormAnswerResponse> {
    const {
      session_id: sessionId,
      form_id: formId,
      episode_id: episodeId,
      tool_kit_id: toolkitId,
      schedule_id,
      user_appointment_id: userAppointmentId,
    } = input;

    await this.validateSaveFormAnswersInput(input);

    const isFormSubmitted = await this.formsRepo.isFormSubmittedForSessionId(
      sessionId,
    );
    if (isFormSubmitted) {
      throw new BadRequestException(`forms.form_already_submitted`);
    }

    const requests: (Promise<Form | ToolkitEpisode | ScheduleEntity> | null)[] =
      [this.formsRepo.getFormByFormId(formId)];

    if (episodeId && toolkitId) {
      const toolkitEpisode = this.formsRepo.getToolkitEpisode(
        episodeId,
        toolkitId,
        formId,
      );
      requests.push(toolkitEpisode);
    } else {
      requests.push(null);
    }

    if (userAppointmentId) {
      const appointmentSchedule = this.formsRepo.getScheduleAppointment(
        schedule_id,
        userAppointmentId,
        formId,
      );
      requests.push(appointmentSchedule);
    } else {
      requests.push(null);
    }

    const [form, toolkitEpisode, appointmentSchedule] = await Promise.all(
      requests,
    );

    if (!form) {
      throw new NotFoundException(`forms.form_not_found`);
    }

    if (episodeId && !toolkitEpisode) {
      throw new NotFoundException(`forms.toolkit_episode_not_found`);
    }

    if (userAppointmentId && !appointmentSchedule) {
      throw new NotFoundException(`forms.appointment_schedule_not_found`);
    }

    const { hlp_reward_points, is_results_page_enabled } = form as Form;

    const saveUserFormAnswerDto: SaveUserFormAnswerDto = {
      ...input,
      user_id: userId,
      hlp_points_earned: hlp_reward_points,
    };

    const userFormAnswer = await this.formsRepo.saveUserFormAnswers(
      saveUserFormAnswerDto,
    );

    if (!userFormAnswer) {
      throw new BadRequestException(`forms.failed_user_form_answer`);
    }
    this.eventEmitter.emit(
      FormsEvent.USER_FORM_ANSWER_ADDED,
      new UserFormAnswerEvent(userFormAnswer),
    );
    return { userFormAnswer, isResultsPageEnabled: is_results_page_enabled };
  }

  async getFormResult(
    userFormAnswersId: string,
    lang?: string,
  ): Promise<FormResultResponse> {
    const userFormAnswers = await this.formsRepo.getUserFormById(
      userFormAnswersId,
    );
    if (!userFormAnswers) {
      throw new NotFoundException(`forms.user_form_answer_not_found`);
    }

    const {
      form_id: formId,
      session_id: sessionId,
      user_id: userId,
    } = userFormAnswers;

    const hlpPointsEarned = await this.formsRepo.getFormEarnedPointsBySessionId(
      userId,
      formId,
      sessionId,
    );

    const result = await this.formsRepo.getFormSubmitPageInfo(
      formId,
      hlpPointsEarned,
    );

    if (!result) {
      return {
        hlpPointsEarned,
      };
    }
    const [translatedForm] =
      this.translationService.getTranslations<FormSubmitPageInfo>(
        [result.form_submit_page_info],
        [
          'title',
          'description',
          'extra_information_description',
          'extra_information_title',
        ],
        lang,
      );
    const [translatedRecommendedToolkit] =
      this.translationService.getTranslations<Toolkit>(
        result.tool_kits ? [result?.tool_kits] : [],
        [
          'title',
          'description',
          'tool_type_text',
          'extra_information_title',
          'extra_information_description',
          'todo_screen_description',
          'tool_description',
          'tool_kit_info',
        ],
        lang,
      );

    const formResultResponse: FormResultResponse = {
      hlpPointsEarned,
      formSubmitPageInfo: translatedForm,
      recommendedToolkit: translatedRecommendedToolkit,
    };
    return formResultResponse;
  }

  getMappedFormQuestionAnswersWithOptions(
    pageQuestionAnswers: PageQuestionAnswersDto[],
  ): PageQuestionAnswers[] {
    return pageQuestionAnswers.map(
      ({ question, options, answers, image, audio, video, toolkit }) => {
        const mappedOptions: QuestionOptionsWithStatus[] = options.map(
          (option) => {
            const is_selected = answers.some((ans) => {
              if ('answer' in ans) {
                return ans.answer === option.id;
              }
              if ('option_id' in ans) {
                return ans.option_id === option.id;
              }
            });
            return { ...option, is_selected };
          },
        );
        const mappedAnswers: FormHistoryQuestionAnswers[] = answers.map(
          (answer) => ({
            ...answer,
            question_type: question.question_type,
          }),
        );
        return {
          question,
          options: mappedOptions,
          answers: mappedAnswers,
          image,
          audio,
          video,
          toolkit,
        };
      },
    );
  }

  async getFormHistory(
    args: GetFormHistoryArgs,
    userId: string,
  ): Promise<GetFormHistoryResponse> {
    const {
      toolkitId,
      sessionId,
      nextPageId: inputPageId,
      formId: form_id,
    } = args;
    let formWithPages;
    if (toolkitId) {
      formWithPages = await this.formsRepo.getFormWithPagesByToolkitId(
        toolkitId,
      );
    }
    if (form_id) {
      formWithPages = await this.formsRepo.getFormWithPagesByFormId(form_id);
    }

    if (!formWithPages) {
      throw new NotFoundException(`forms.form_not_found`);
    }
    const { form, pages } = formWithPages;
    if (!form) {
      throw new NotFoundException(`forms.form_not_found`);
    }
    if (!pages.length) {
      throw new NotFoundException(`forms.form_or_page_not_found `);
    }
    const pageId = inputPageId ? inputPageId : pages[0].id;

    const { id: formId } = form;
    const [pageQuestionAnswers, nextPageId] = await Promise.all([
      this.formsRepo.getPageQuestionsAndAnswersWithOptions(
        formId,
        pageId,
        sessionId,
        userId,
      ),
      this.formsRepo.getNextPageId(formId, pageId),
    ]);
    const mappedAnswers =
      this.getMappedFormQuestionAnswersWithOptions(pageQuestionAnswers);

    const formPage = pages.find((page) => page.id === pageId) as FormPage;
    const formInfo: GetFormHistoryResponse = {
      formPage: formPage,
      totalPages: pages.length,
      nextPageId: nextPageId,
      pageQuestionAnswers: mappedAnswers,
    };
    return formInfo;
  }

  private combineQuestionPoints(
    appointmentFormQuestionInsight: AppointmentFormQuestionInsight[],
  ): AppointmentFormQuestionInsight[] {
    const combinedQuestionPoints: {
      [key: string]: AppointmentFormQuestionInsight;
    } = {};

    appointmentFormQuestionInsight.forEach((questionInsight) => {
      const { question_id, earned_points, maximum_points } = questionInsight;
      if (!combinedQuestionPoints[question_id]) {
        combinedQuestionPoints[question_id] = { ...questionInsight };
      } else {
        combinedQuestionPoints[question_id].earned_points += earned_points;
        combinedQuestionPoints[question_id].maximum_points += maximum_points;
      }
    });
    return Object.values(combinedQuestionPoints);
  }

  getMappedFormQuestionAndAnswersWithDate(
    formQuestionAndAnswersWithDate: FormQuestionAndAnswersWithDate[],
  ): FormQuestionAndAnswersWithDate[] {
    const mappedformQuestionsInsights: FormQuestionAndAnswersWithDate[] = [];

    formQuestionAndAnswersWithDate.forEach((formQuestionAndAnswers) => {
      const { date, form_questions_and_options_with_answers } =
        formQuestionAndAnswers;
      const appointmentCompletedDate = this.utilService.formatDate(
        new Date(date),
        'dd-MM-yyyy',
      );

      const existingObj = mappedformQuestionsInsights.find(
        (item) =>
          this.utilService.formatDate(new Date(item.date), 'dd-MM-yyyy') ===
          appointmentCompletedDate,
      );

      if (existingObj) {
        existingObj.form_questions_and_options_with_answers = [
          ...existingObj.form_questions_and_options_with_answers,
          ...form_questions_and_options_with_answers,
        ];
      } else {
        mappedformQuestionsInsights.push({
          date: appointmentCompletedDate,
          form_questions_and_options_with_answers:
            form_questions_and_options_with_answers,
        });
      }
    });
    return mappedformQuestionsInsights;
  }

  getAppointmentFormQuestionInsights(
    formQuestionAndAnswersWithDate: FormQuestionAndAnswersWithDate[],
  ): AppointmentFormInsight[] {
    if (!formQuestionAndAnswersWithDate.length) {
      return [];
    }

    const mappedformQuestionsInsights =
      this.getMappedFormQuestionAndAnswersWithDate(
        formQuestionAndAnswersWithDate,
      );

    const appointmentFormInsight: AppointmentFormInsight[] = [];

    mappedformQuestionsInsights.forEach((mappedformQuestionsInsight) => {
      if (!mappedformQuestionsInsight) {
        this.logger.log('form question insights not found');
        return;
      }

      const {
        form_questions_and_options_with_answers:
          formQuestionsAndOptionsWithAnswers,
        date,
      } = mappedformQuestionsInsight;

      const appointmentFormQuestionInsight: AppointmentFormQuestionInsight[] =
        [];

      if (!formQuestionsAndOptionsWithAnswers.length) {
        this.logger.log('form question and answers with options not found');
        return;
      }

      formQuestionsAndOptionsWithAnswers.forEach(
        (formQuestionAndOptionsWithAnswer) => {
          if (!formQuestionAndOptionsWithAnswer) {
            this.logger.log('form question and answers with options not found');
            return;
          }
          const { answers, options, ...question } =
            formQuestionAndOptionsWithAnswer;

          if (!question?.ranking) {
            return;
          }

          const commonQuestionOptions = options as CommonQuestionOption[];

          let maximumPoints = 0;
          let earnedPoints = 0;

          if (
            commonQuestionOptions.length &&
            question.points_calculation_type ===
              PointCalculationType.OPTIONS_LEVEL
          ) {
            maximumPoints = commonQuestionOptions.reduce(
              (max, option) => Math.max(max, option.points || 0),
              0,
            );
          } else {
            maximumPoints = question.points || 0;
          }

          const questionAnswer = answers.find(
            (answer) => answer.question_id === question.id,
          );

          if (questionAnswer) {
            //Calculate the points based on the answer
            if (
              question.points_calculation_type ===
              PointCalculationType.OPTIONS_LEVEL
            ) {
              if (question.question_type === QuestionType.CIRCULAR_SLIDER) {
                for (const option of options) {
                  if (
                    'starting_angle' in option &&
                    'answer' in questionAnswer
                  ) {
                    const { starting_angle, maximum_angle } = option;
                    const { answer } = questionAnswer;
                    if (
                      Number(answer) >= starting_angle &&
                      Number(answer) <= maximum_angle
                    ) {
                      earnedPoints += option.points || 0;
                    }
                  }
                }
              }

              if (question.question_type === QuestionType.HORIZONTAL_SLIDER) {
                for (const option of options) {
                  if (
                    'starting_value' in option &&
                    'answer' in questionAnswer
                  ) {
                    const { starting_value, maximum_value } = option;
                    const { answer } = questionAnswer;
                    if (
                      Number(answer) >= starting_value &&
                      Number(answer) <= maximum_value
                    ) {
                      earnedPoints += option.points || 0;
                    }
                  }
                }
              }

              if ('option_id' in questionAnswer) {
                const selectedOption = options.find(
                  (option) => option.id === questionAnswer.option_id,
                );
                if (selectedOption && 'points' in selectedOption) {
                  earnedPoints += selectedOption.points || 0;
                }
              }

              if ('answer' in questionAnswer) {
                const selectedOption = options.find(
                  (option) => option.id === questionAnswer.answer,
                );

                if (selectedOption && 'points' in selectedOption) {
                  earnedPoints += selectedOption.points || 0;
                }
              }
            }
          }

          if (
            question.points_calculation_type ===
            PointCalculationType.QUESTION_LEVEL
          ) {
            earnedPoints += question.points || 0;
          }

          const questionInsight: AppointmentFormQuestionInsight = {
            category_sequence: question.ranking,
            question_id: question.id,
            date,
            earned_points: earnedPoints,
            maximum_points: maximumPoints,
          };
          appointmentFormQuestionInsight.push(questionInsight);
        },
      );

      //Combine the multiple question answers from same date
      const mappedFormQuestionCategories = this.combineQuestionPoints(
        appointmentFormQuestionInsight,
      );

      const formQuestionInsight: AppointmentFormInsight = {
        date,
        questionInsight: mappedFormQuestionCategories,
      };
      appointmentFormInsight.push(formQuestionInsight);
    });

    return appointmentFormInsight;
  }

  async getAppointmentFormsInsight(
    args: GetAppointmentFormsInsightArgs,
  ): Promise<GetAppointmentFormsInsightResponse> {
    const { treatmentId, formInsightType, categoryFilter } = args;

    if (categoryFilter?.length && categoryFilter.length > 7) {
      throw new NotFoundException(`Category Filters can be seven at max `);
    }

    const uniqueCategoryFilter = [...new Set(categoryFilter)];

    const filteredCategories = uniqueCategoryFilter.filter(
      (category) => category >= 1 && category <= 7,
    );

    const treatment = await this.formsRepo.getTreatmentById(treatmentId);

    if (!treatment) {
      throw new NotFoundException(`Treatment not found`);
    }

    const formId =
      formInsightType === FormInsightType.SESSION
        ? this.configService.getOrThrow<string>(EnvVariable.SESSION_FORM_ID)
        : this.configService.getOrThrow<string>(EnvVariable.COMPLAINT_FORM_ID);

    const formQuestionAndAnswersWithDate =
      await this.formsRepo.getFormQuestionAndAnswersWithDate(
        treatmentId,
        formId,
        formInsightType,
        filteredCategories,
      );

    const appointmentFormInsight = this.getAppointmentFormQuestionInsights(
      formQuestionAndAnswersWithDate,
    );
    return { appointment_form_insight: appointmentFormInsight };
  }
}
