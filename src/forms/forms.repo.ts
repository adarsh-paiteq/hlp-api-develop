import { Database } from '@core/modules/database/database.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Users } from '../users/users.model';
import {
  FormWithPages,
  PageQuestionsDto,
  questionAnswersTableNames,
  questionOptionsTableNamesForCaseQuery,
  SaveFormPagePoints,
} from './dto/forms.dto';
import {
  PageQuestions,
  PageQuestionsWithOptionsDto,
} from './dto/get-form-page-questions.dto';
import {
  FormQuestionAnswers,
  SaveFormPageQuestionAnswersInput,
  SaveFormQuestionAnswers,
} from './dto/save-form-page-question-answers.dto';
import { SaveUserFormAnswerDto } from './dto/save-user-form-answers.dto';
import { FormPagePoints } from './entities/form-page-points.entity';
import { QuestionType } from './entities/form-page-question.entity';
import { FormPage } from './entities/form-page.entity';
import { Form } from './entities/form.entity';
import { UserFormAnswer } from './entities/user-form-answer.entity';
import {
  ScheduleEntity,
  ScheduleFor,
} from '../schedules/entities/schedule.entity';
import { PageQuestionAnswersDto } from './dto/get-form-history.dto';
import { FormResultPageDetails } from './dto/get-form-result.dto';
import { ToolkitEpisode } from '../toolkits/entities/toolkit-episode.entity';
import {
  FormInsightType,
  FormQuestionAndAnswersWithDate,
} from './dto/get-appointment-form-insight.dto';
import { Treatment } from '@treatments/entities/treatments.entity';

@Injectable()
export class FormsRepo {
  private readonly logger = new Logger(FormsRepo.name);
  constructor(private readonly database: Database) {}

  async getFormWithPagesByToolkitId(
    toolkitId: string,
    formId?: string,
  ): Promise<FormWithPages> {
    const params = [toolkitId, ...(formId ? [formId] : [])];
    const tableName = formId ? 'tool_kits_episodes' : 'tool_kit_forms';
    const query = `SELECT ROW_TO_JSON(forms.*) as form, 
    COALESCE(JSON_AGG(form_pages.*) FILTER (WHERE form_pages.id IS NOT NULL),'[]') AS pages
    FROM forms
    LEFT JOIN ${tableName} ON ${tableName}.form_id = forms.id
    LEFT JOIN form_pages ON forms.id = form_pages.form
    WHERE ${tableName}.tool_kit_id = $1 ${
      formId ? `AND ${tableName}.form_id = $2` : ' '
    }
    GROUP BY forms.id
    ORDER BY MIN(form_pages.created_at);`;
    const [formWithPages] = await this.database.query<FormWithPages>(
      query,
      params,
    );
    return formWithPages;
  }

  getQuestionOptionsQuery(): string {
    const query = `COALESCE( CASE ${Array.from(
      questionOptionsTableNamesForCaseQuery,
      ([questionType, table]) => {
        return `
         WHEN form_page_questions.question_type = '${questionType}' THEN 
         (SELECT COALESCE(JSON_AGG(${table}.* ORDER BY ${table}.ranking ASC),'[]') FROM ${table} WHERE ${table}.question = form_page_questions.id)`;
      },
    ).join(' ')}
    END, '[]'
  ) AS options`;
    return query;
  }

  async getPageQuestionsWithOptions(
    formId: string,
    pageId: string,
  ): Promise<PageQuestionsWithOptionsDto[]> {
    const questionOptionsQuery = this.getQuestionOptionsQuery();
    const query = `SELECT ROW_TO_JSON(form_page_questions.*) AS question,
    ( SELECT COALESCE(JSON_AGG(validation) FILTER (WHERE validation.id IS NOT NULL),'[]')
      FROM ( SELECT * FROM question_validations WHERE question_validations.question = form_page_questions.id ) validation
    ) AS validations,

    ( SELECT ROW_TO_JSON(question_image)
      FROM ( SELECT * FROM question_images WHERE question_images.question = form_page_questions.id ) question_image
    ) AS image,

    ( SELECT ROW_TO_JSON(question_audio)
    FROM ( SELECT * FROM question_audios WHERE question_audios.question = form_page_questions.id ) question_audio
    ) AS audio,

    ( SELECT ROW_TO_JSON(question_video)
      FROM ( SELECT * FROM question_videos WHERE question_videos.question = form_page_questions.id ) question_video
    ) AS video,

    ( SELECT ROW_TO_JSON(toolkit)
      FROM ( SELECT tool_kits.*  FROM habit_tool_kit_question
        LEFT JOIN tool_kits ON habit_tool_kit_question.tool_kit_id = tool_kits.id
        WHERE habit_tool_kit_question.question = form_page_questions.id
      ) toolkit
    ) AS toolkit,
     ${questionOptionsQuery}
      FROM form_page_questions 
      WHERE form_page_questions.form = $1 AND form_page_questions.page = $2
      GROUP BY form_page_questions.id
      ORDER BY form_page_questions.ranking`;

    const questionsWithOptions = await this.database.query<PageQuestions>(
      query,
      [formId, pageId],
    );
    return questionsWithOptions;
  }

  async getNextPageId(
    formId: string,
    pageId: string,
  ): Promise<string | undefined> {
    const query = `SELECT id  FROM form_pages 
    WHERE form = $1 AND created_at > ( SELECT created_at FROM form_pages WHERE form = $1 AND id = $2 ) 
    ORDER BY created_at LIMIT 1;`;
    const [response] = await this.database.query<{ id: string }>(query, [
      formId,
      pageId,
    ]);
    if (!response) {
      return;
    }
    return response.id;
  }

  async getFormPageByPageId(pageId: string): Promise<FormPage> {
    const query = `SELECT *  FROM form_pages WHERE form_pages.id = $1`;
    const [formPage] = await this.database.query<FormPage>(query, [pageId]);
    return formPage;
  }

  async getFormByFormId(formId: string): Promise<Form> {
    const query = `SELECT *  FROM forms WHERE forms.id = $1`;
    const [formPage] = await this.database.query<Form>(query, [formId]);
    return formPage;
  }

  async getUserSchedule(
    scheduleId: string,
    userId: string,
    date: string,
  ): Promise<ScheduleEntity> {
    const query = `SELECT schedules.* FROM schedules WHERE schedules.id = $1 AND schedules.user = $2 
    AND(
      schedules.is_schedule_disabled = false
      OR(
        schedules.is_schedule_disabled = true
        AND schedules.end_date ::DATE > $3 ::DATE
      )
    )`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [
      scheduleId,
      userId,
      date,
    ]);
    return schedule;
  }

  async getFormPagePointsDetails(
    userId: string,
    formId: string,
    pageId: string,
    sessionId: string,
  ): Promise<FormPagePoints> {
    const parms = [formId, pageId, userId, sessionId];
    const query = `SELECT *  FROM form_page_points 
    WHERE form_page_points.form_id = $1 
    AND form_page_points.page_id = $2
    AND form_page_points.user_id = $3
    AND form_page_points.session_id = $4`;
    const [formPagePoints] = await this.database.query<FormPagePoints>(
      query,
      parms,
    );
    return formPagePoints;
  }

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  getQuestionAnswerDeleteQuery(
    input: SaveFormPageQuestionAnswersInput,
    userId: string,
  ): string {
    const { form_id, page_id, session_id } = input;
    const query = `${Array.from(questionAnswersTableNames, ([, table]) => {
      return `
        DELETE FROM ${table} WHERE ${table}.user_id = '${userId}'
        AND ${table}.form_id = '${form_id}'
        AND ${table}.page_id = '${page_id}'
        AND ${table}.session_id = '${session_id}' ;
        `;
    }).join(' ')}`;
    return query;
  }

  getQuestionAnswerInsertQuery(answers: SaveFormQuestionAnswers[]): string {
    //TODO: add question_type in query when field added in answers table
    const query = answers.map(({ question_type, ...saveAnswer }) => {
      const tableName = questionAnswersTableNames.get(
        question_type as QuestionType,
      );
      if (!tableName) {
        throw new NotFoundException(`table name not found ${question_type}`);
      }
      const keys = Object.keys(saveAnswer).join(', ');
      const values = Object.values(saveAnswer)
        .map((value) => `'${value}'`)
        .join(', ');

      return `INSERT INTO ${tableName} (${keys}) VALUES (${values})  RETURNING *;`;
    });

    return query.join(' ');
  }

  /**@description query will always delete the previous records for same page and session and add new records */
  async deleteAndInsertFormPageQuestionAnswers(
    answers: SaveFormQuestionAnswers[],
    input: SaveFormPageQuestionAnswersInput,
    userId: string,
  ): Promise<FormQuestionAnswers[]> {
    const deleteQuery = this.getQuestionAnswerDeleteQuery(input, userId);
    const insertQuery = this.getQuestionAnswerInsertQuery(answers);
    const query = `BEGIN; ${deleteQuery} ${insertQuery} COMMIT;`;

    try {
      const result = await this.database.batchQuery<FormQuestionAnswers>(query);
      return result.flat();
    } catch (error) {
      await this.database.query('ROLLBACK');
      this.logger.error(error);
      throw error;
    }
  }

  async saveFormPagePoints(
    formPagePoints: SaveFormPagePoints,
  ): Promise<FormPagePoints> {
    const keys = Object.keys(formPagePoints).join(', ');
    const values = Object.values(formPagePoints);
    const placeholders = values
      .map((value, index) => `$${index + 1}`)
      .join(', ');
    const query = `INSERT INTO form_page_points (${keys}) VALUES (${placeholders}) RETURNING *;`;
    const [savedFormPagePoints] = await this.database.query<FormPagePoints>(
      query,
      values,
    );
    return savedFormPagePoints;
  }

  async updateFormPagePoints(
    formPagePointsId: string,
    earnedPoints: number,
  ): Promise<FormPagePoints> {
    const query = `UPDATE form_page_points SET calculated_points = $2 WHERE id = $1 RETURNING *`;
    const [updatedFormPagePoints] = await this.database.query<FormPagePoints>(
      query,
      [formPagePointsId, earnedPoints],
    );
    return updatedFormPagePoints;
  }

  async getFormPageQuestionsByQuestionIds(
    formId: string,
    pageId: string,
    questionIds: string[],
  ): Promise<PageQuestionsDto[]> {
    const questionOptionsQuery = this.getQuestionOptionsQuery();
    const questionIdsString = questionIds.map((id) => `'${id}'`).join(', ');

    const query = `SELECT ROW_TO_JSON(form_page_questions.*) AS question,
     ${questionOptionsQuery}
      FROM form_page_questions 
     WHERE form_page_questions.form = $1
     AND form_page_questions.page = $2
     AND form_page_questions.id IN( ${questionIdsString} )
     GROUP BY form_page_questions.id
     ORDER BY form_page_questions.ranking`;
    const questionsWithOptions = await this.database.query<PageQuestionsDto>(
      query,
      [formId, pageId],
    );
    return questionsWithOptions;
  }

  async isFormSubmittedForSessionId(sessionId: string): Promise<boolean> {
    const query = `SELECT *  FROM user_form_answers 
    WHERE user_form_answers.session_id = $1`;
    const userFormAnswer = await this.database.query<UserFormAnswer>(query, [
      sessionId,
    ]);
    return userFormAnswer.length > 0;
  }

  async getFormEarnedPointsBySessionId(
    userId: string,
    formId: string,
    sessionId: string,
  ): Promise<number> {
    const query = `
    SELECT COALESCE(SUM(form_page_points.calculated_points),0) as earned_points
    FROM form_page_points
    WHERE form_page_points.user_id = $1 AND form_page_points.form_id = $2 AND form_page_points.session_id = $3`;
    const [result] = await this.database.query<{ earned_points: string }>(
      query,
      [userId, formId, sessionId],
    );
    return Number(result.earned_points);
  }

  async saveUserFormAnswers(
    userFormAnswerDto: SaveUserFormAnswerDto,
  ): Promise<UserFormAnswer> {
    const query = `INSERT INTO user_form_answers (${Object.keys(
      userFormAnswerDto,
    ).toString()}) VALUES (${Object.keys(userFormAnswerDto)
      .map((value, index) => `$${index + 1}`)
      .toString()}) RETURNING *;`;

    const [userFormAnswer] = await this.database.query<UserFormAnswer>(
      query,
      Object.values(userFormAnswerDto),
    );
    return userFormAnswer;
  }

  async getUserFormById(id: string): Promise<UserFormAnswer> {
    const query = `SELECT * FROM user_form_answers WHERE id=$1`;
    const [form] = await this.database.query<UserFormAnswer>(query, [id]);
    return form;
  }

  async getFormSubmitPageInfo(
    formId: string,
    earnedPoints: number,
  ): Promise<FormResultPageDetails> {
    const query = `
    SELECT ROW_TO_JSON(form_submit_page_info.*) AS form_submit_page_info , ROW_TO_JSON(tool_kits.*) AS tool_kits
    FROM form_submit_page_info
    LEFT JOIN tool_kits ON form_submit_page_info.recommended_tool_kit = tool_kits.id
    WHERE form_submit_page_info.form_id = $1 AND $2 BETWEEN form_submit_page_info.min_points AND form_submit_page_info.max_points`;
    const [formResult] = await this.database.query<FormResultPageDetails>(
      query,
      [formId, earnedPoints],
    );
    return formResult;
  }

  getQuestionAnswersQuery(): string {
    const query = `COALESCE( CASE ${Array.from(
      questionAnswersTableNames,
      ([questionType, table]) => {
        return `
         WHEN form_page_questions.question_type = '${questionType}' THEN 
         COALESCE(JSON_AGG(DISTINCT ${table}.*) FILTER (WHERE ${table}.id IS NOT NULL),'[]')`;
      },
    ).join(' ')}
    END, '[]'
  ) AS answers`;
    return query;
  }

  getQuestionAnswersJoinsQuery(): string {
    const query = `${Array.from(questionAnswersTableNames, ([, table]) => {
      return `LEFT JOIN ${table} ON ${table}.question_id = form_page_questions.id
       AND ${table}.user_id = $3 AND ${table}.session_id = $4  `;
    }).join(' ')} `;
    return query;
  }

  async getPageQuestionsAndAnswersWithOptions(
    formId: string,
    pageId: string,
    sessionId: string,
    userId: string,
  ): Promise<PageQuestionAnswersDto[]> {
    const questionOptionsQuery = this.getQuestionOptionsQuery();
    const questionAnswersQuery = this.getQuestionAnswersQuery();
    const questionAnswersJoinsQuery = this.getQuestionAnswersJoinsQuery();
    const query = `SELECT ROW_TO_JSON(form_page_questions.*) AS question,
    ( SELECT ROW_TO_JSON(question_image)
      FROM ( SELECT * FROM question_images WHERE question_images.question = form_page_questions.id ) question_image
    ) AS image,

    ( SELECT ROW_TO_JSON(question_audio)
    FROM ( SELECT * FROM question_audios WHERE question_audios.question = form_page_questions.id ) question_audio
    ) AS audio,

    ( SELECT ROW_TO_JSON(question_video)
      FROM ( SELECT * FROM question_videos WHERE question_videos.question = form_page_questions.id ) question_video
    ) AS video,

    ( SELECT ROW_TO_JSON(toolkit)
      FROM ( SELECT tool_kits.*  FROM habit_tool_kit_question
        LEFT JOIN tool_kits ON habit_tool_kit_question.tool_kit_id = tool_kits.id
        WHERE habit_tool_kit_question.question = form_page_questions.id
      ) toolkit
    ) AS toolkit,
    ${questionOptionsQuery},
     ${questionAnswersQuery}
      FROM form_page_questions 
     ${questionAnswersJoinsQuery}
      WHERE form_page_questions.form = $1 AND form_page_questions.page = $2
      GROUP BY form_page_questions.id
      ORDER BY form_page_questions.ranking`;

    const questionsWithOptions =
      await this.database.query<PageQuestionAnswersDto>(query, [
        formId,
        pageId,
        userId,
        sessionId,
      ]);
    return questionsWithOptions;
  }
  async getFormById(id: string): Promise<UserFormAnswer> {
    const query = `SELECT * FROM user_form_answers where id = $1`;
    const [userFormAnswer] = await this.database.query<UserFormAnswer>(query, [
      id,
    ]);
    return userFormAnswer;
  }

  async getToolkitEpisode(
    episodeId: string,
    toolkitId: string,
    formId: string,
  ): Promise<ToolkitEpisode> {
    const query = `SELECT * FROM tool_kits_episodes WHERE id = $1 AND tool_kit_id = $2 AND form_id = $3`;
    const [userFormAnswer] = await this.database.query<ToolkitEpisode>(query, [
      episodeId,
      toolkitId,
      formId,
    ]);
    return userFormAnswer;
  }

  async getScheduleAppointment(
    schedule_id: string,
    userAppointmentId: string,
    formId: string,
  ): Promise<ScheduleEntity> {
    const query = `SELECT * FROM schedules WHERE id = $1 AND user_appointment_id=$2 AND(session_form_id = $3 OR complaint_form_id = $3)`;
    const [userFormAnswer] = await this.database.query<ScheduleEntity>(query, [
      schedule_id,
      userAppointmentId,
      formId,
    ]);
    return userFormAnswer;
  }
  async getFormWithPagesByFormId(formId: string): Promise<FormWithPages> {
    const query = `SELECT ROW_TO_JSON(forms.*) as form, 
    COALESCE(JSON_AGG(form_pages.*) FILTER (WHERE form_pages.id IS NOT NULL),'[]') AS pages
    FROM forms
    LEFT JOIN form_pages ON forms.id = form_pages.form
    WHERE forms.id = $1
    GROUP BY forms.id
    ORDER BY MIN(form_pages.created_at);`;
    const [formWithPages] = await this.database.query<FormWithPages>(query, [
      formId,
    ]);
    return formWithPages;
  }

  async getTreatmentById(treatmentId: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE id = $1 AND is_deleted = $2`;
    const [treatment] = await this.database.query<Treatment>(query, [
      treatmentId,
      false,
    ]);
    return treatment;
  }

  getFormInsightQuestionAnswersJoinsQuery(): string {
    const query = `${Array.from(questionAnswersTableNames, ([, table]) => {
      return `LEFT JOIN ${table} ON ${table}.question_id = form_page_questions.id
       AND ${table}.user_id = user_form_answers.user_id AND ${table}.session_id = user_form_answers.session_id  `;
    }).join(' ')} `;
    return query;
  }

  async getFormQuestionAndAnswersWithDate(
    treatmentId: string,
    formId: string,
    formInsightType: FormInsightType,
    filteredCategories: number[],
  ): Promise<FormQuestionAndAnswersWithDate[]> {
    const params = [
      treatmentId,
      ScheduleFor.APPOINTMENT,
      formId,
      filteredCategories,
    ];

    const questionOptionsQuery = this.getQuestionOptionsQuery();
    const questionAnswersQuery = this.getQuestionAnswersQuery();
    const questionAnswersJoinsQuery =
      this.getFormInsightQuestionAnswersJoinsQuery();
    const formIdFieldName =
      formInsightType === FormInsightType.SESSION
        ? 'session_form_id'
        : 'complaint_form_id';

    const query = `SELECT
    user_appointment_answers.session_date AS date,
    form_questions.* AS form_questions_and_options_with_answers
  FROM
    user_appointment_answers
    LEFT JOIN treatments ON treatments.id = $1
    LEFT JOIN schedules ON schedules.treatment_id = treatments.id
    AND schedules.schedule_for = $2
    AND schedules.${formIdFieldName} = $3
    LEFT JOIN LATERAL (
      SELECT
        JSON_AGG(form_questions.*) AS form_questions_and_options_with_answers
      FROM
        user_form_answers
        LEFT JOIN LATERAL (
          SELECT
            form_page_questions.*,
           ${questionOptionsQuery},
           ${questionAnswersQuery}
          FROM
            form_page_questions
            ${questionAnswersJoinsQuery}
          WHERE
            form_page_questions.form = user_form_answers.form_id
            AND form_page_questions.ranking =  ANY( $4::integer[] )
          GROUP BY
            form_page_questions.id
          ORDER BY
            form_page_questions.ranking
        ) AS form_questions ON true
      WHERE
        user_form_answers.appointment_session_id = user_appointment_answers.session_id
    AND user_form_answers.form_id = $3    
    ) AS form_questions ON true
  WHERE
    user_appointment_answers.session_date >= treatments.created_at
    AND schedules.id = user_appointment_answers.schedule_id
  ORDER BY
    user_appointment_answers.session_date`;
    const formQuestionAndAnswersWithDate =
      await this.database.query<FormQuestionAndAnswersWithDate>(query, params);
    return formQuestionAndAnswersWithDate;
  }
}
