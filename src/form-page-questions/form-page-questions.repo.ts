import { Injectable } from '@nestjs/common';
import { FormToolkitAnswers } from '../toolkits/toolkits.model';
import { Database } from '../core/modules/database/database.service';
import { FormPageQuestion } from './entities/form-page-question.entity';
import { Form } from './entities/form.entity';
import { FormResultPageDetails } from './dto/form-page-questions-points.dto';

@Injectable()
export class FormPageQuestionsRepo {
  constructor(private readonly database: Database) {}

  async getFormPageQuestionByPageId(pageId: string): Promise<FormPageQuestion> {
    const query = `SELECT * FROM form_page_questions WHERE page=$1`;
    const [formPageQuestion] = await this.database.query<FormPageQuestion>(
      query,
      [pageId],
    );
    return formPageQuestion;
  }

  async getFormPagesQuestions(
    formId: string,
    pageIds: string[],
  ): Promise<FormPageQuestion[]> {
    const batchQuery = pageIds.reduce((acc, pageId) => {
      const query = `SELECT * FROM form_page_questions WHERE page='${pageId}' AND form='${formId}'; `;
      return acc + query;
    }, ``);
    const questions = await this.database.batchQuery<FormPageQuestion>(
      batchQuery,
    );
    return questions.flat();
  }

  async getFormById(id: string): Promise<Form> {
    const query = `SELECT * FROM forms WHERE id=$1`;
    const [form] = await this.database.query<Form>(query, [id]);
    return form;
  }

  async getQuestionOptionPointsAggragateByPageId(
    pageId: string,
    tableName: string,
  ): Promise<number> {
    const query = `SELECT COALESCE(SUM(points),0) AS total
    FROM ${tableName} WHERE page=$1`;
    const [options] = await this.database.query<{ total: number }>(query, [
      pageId,
    ]);
    return options.total;
  }

  async getFormPages(formId: string): Promise<string[]> {
    const query = `SELECT id FROM form_pages WHERE form = $1`;
    const formPages = await this.database.query<{ id: string }>(query, [
      formId,
    ]);
    const formPagesIds = formPages.map((formPage) => {
      return formPage.id;
    });
    return formPagesIds;
  }

  async getUserFormById(id: string): Promise<FormToolkitAnswers> {
    const query = `SELECT * FROM user_form_answers WHERE id=$1`;
    const [form] = await this.database.query<FormToolkitAnswers>(query, [id]);
    return form;
  }

  async getFormResultPageDetailsById(
    formId: string,
  ): Promise<FormResultPageDetails> {
    const query = `SELECT
    json_agg(form_submit_page_info.*) AS form_submit_page_info , json_agg(tool_kits.*) AS tool_kits
  FROM
    form_submit_page_info
    LEFT JOIN tool_kits ON form_submit_page_info.recommended_tool_kit = tool_kits.id
  WHERE
    form_submit_page_info.form_id = $1`;
    const [formResult] = await this.database.query<FormResultPageDetails>(
      query,
      [formId],
    );
    return formResult;
  }
}
