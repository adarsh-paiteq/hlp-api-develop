import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GenerateUUIDResponse,
  GetFormResultResponse,
} from './dto/form-page-questions-points.dto';
import {
  FormPageQuestion,
  PointCalculationType,
} from './entities/form-page-question.entity';
import { FormPageQuestionsRepo } from './form-page-questions.repo';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class FormPageQuestionsService {
  private readonly logger = new Logger(FormPageQuestionsService.name);
  constructor(private readonly formPageQuestionsRepo: FormPageQuestionsRepo) {}

  generateUUID(): GenerateUUIDResponse {
    return {
      uuid: uuidv4(),
    };
  }
  async getFormResult(
    userFormAnswersId: string,
  ): Promise<GetFormResultResponse> {
    const userFormAnswers = await this.formPageQuestionsRepo.getUserFormById(
      userFormAnswersId,
    );
    if (!userFormAnswers) {
      throw new NotFoundException(
        `form-page-questions.user_form_answer_not_found`,
      );
    }
    const { form_id: formId } = userFormAnswers;
    const [pageIds, formResult] = await Promise.all([
      this.formPageQuestionsRepo.getFormPages(formId),
      this.formPageQuestionsRepo.getFormResultPageDetailsById(formId),
    ]);

    if (!formResult.form_submit_page_info || !formResult.tool_kits) {
      throw new NotFoundException(
        `form-page-questions.form_result_page_info_not_found`,
      );
    }
    const {
      form_submit_page_info: [formSubmitPageInfo],
      tool_kits: [recommendedToolkit],
    } = formResult;
    const formPageQuestions =
      await this.formPageQuestionsRepo.getFormPagesQuestions(formId, pageIds);

    if (!formPageQuestions) {
      throw new NotFoundException(`form-page-questions.no_questions_found`);
    }

    const formPageQuestionsWithPoints: FormPageQuestion[] = [];
    const formPageQuestionWithOptions: FormPageQuestion[] = [];
    formPageQuestions.forEach((formPageQuestion) => {
      const isQuestionLevel =
        formPageQuestion.points_calculation_type ===
        PointCalculationType.QUESTION_LEVEL;
      if (isQuestionLevel) {
        formPageQuestionsWithPoints.push(formPageQuestion);
      } else {
        formPageQuestionWithOptions.push(formPageQuestion);
      }
    });
    const formPageQuestionsWithPointsTotal = formPageQuestionsWithPoints.reduce(
      (aggragate, next) => {
        aggragate += Number(next.points);
        return aggragate;
      },
      0,
    );
    const points = formPageQuestionsWithPointsTotal;

    // const formPage =
    //   await this.formPageQuestionsRepo.getFormPageQuestionByPageId(id);
    // if (!formPage) {
    //   throw new NotFoundException(`Form page not found`);
    // }
    // let points = 0;
    // const isQuestionLevel =
    //   formPage.points_calculation_type === PointCalculationType.QUESTION_LEVEL;
    // if (isQuestionLevel && formPage.points) {
    //   points += formPage.points;
    // }
    // const form = await this.formPageQuestionsRepo.getFormById(formPage.form);
    // if (!form) {
    //   throw new NotFoundException(`Form not found`);
    // }
    // points += form.hlp_reward_points;

    // const isOptionsLevel =
    //   formPage.points_calculation_type === PointCalculationType.OPTIONS_LEVEL;
    // if (isOptionsLevel) {
    //   const tableName = QuestionTableNames.get(formPage.question_type);
    //   if (!tableName) {
    //     throw new NotFoundException(
    //       `${formPage.question_type} table name not found`,
    //     );
    //   }
    //   const totalPoint =
    //     await this.formPageQuestionsRepo.getQuestionOptionPointsAggragateByPageId(
    //       formPage.page,
    //       tableName,
    //     );
    //   points += Number(totalPoint);
    // }
    const response: GetFormResultResponse = {
      points,
      formSubmitPageInfo,
      recommendedToolkit,
    };
    return response;
  }
}
