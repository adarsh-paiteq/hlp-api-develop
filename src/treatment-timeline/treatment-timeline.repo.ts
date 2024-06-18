import { Database } from '@core/modules/database/database.service';
import { Injectable } from '@nestjs/common';
import { StageWithStageMessagesDTO } from './dto/get-stage.dto';
import { InsertStageInput, InsertStageMessageInput } from './dto/add-stage.dto';
import { StageMessages } from './entities/stage-messages.entity';
import { Stage, StageType } from './entities/stage.entity';
import {
  UpdateStageMessagesInput,
  StageUpdateDto,
} from './dto/update-stage.dto';
import {
  TimelineAttachmentType,
  TreatmentTimelineAttachment,
} from './entities/treatment-timeline-attachment.entity';
import {
  InsertTreatmentFileInput,
  InsertTreatmentTimeline,
  StageWithStageMessageDTO,
  TreatmentUserDTO,
} from './dto/add-treatment-file.dto';
import { TreatmentTimeline } from './entities/treatment-timeline.entity';
import {
  TreatmentWithDoctorRole,
  TreatmentWithUserDTO,
} from './dto/treatment-timeline.dto';
import { Treatment } from '@treatments/entities/treatments.entity';
import {
  Toolkit,
  ToolkitType,
  toolkitAnswerTables,
} from '@toolkits/toolkits.model';
import { InsertTreatmentNoteInput } from './dto/add-treatment-note.dto';
import {
  GetTreatmentTimelineDTO,
  TreatementTimelineDTO,
  TreatementTimelineFilter,
} from './dto/get-treatment-timeline.dto';
import { Users } from '@users/users.model';
import { UserRoles } from '@users/users.dto';
import { toolKitUserOptionTables } from '@schedules/schedules.repo';
import { SaveScheduleInput } from '@schedules/dto/create-schedule.dto';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { UpdateTreatmentTimelineNote } from './dto/edit-treatment-timeline-note.dto';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';
import { UpdateTreatmentTimelineFile } from './dto/edit-treatment-timeline-file.dto';

@Injectable()
export class TreatmentTimelineRepo {
  constructor(private readonly database: Database) {}

  async getStage(stageId: string): Promise<StageWithStageMessagesDTO> {
    const query = `
    SELECT stages.*, 
    ROW_TO_JSON(treatment_options.*) AS treatment_options, 
    ROW_TO_JSON(organisations.*) AS organisations ,
    json_agg(stage_messages.*) AS stage_messages
    FROM stages
    LEFT JOIN stage_messages ON stage_messages.stage_id=stages.id
    LEFT JOIN treatment_options ON treatment_options.id=stages.treatment_option_id
    LEFT JOIN organisations ON organisations.id=stages.organisation_id
    WHERE stages.id=$1 AND stage_messages.is_deleted=$2 AND stages.is_active=$3 AND stages.is_deleted=$2
    GROUP BY
    stages.id,treatment_options.id,
    organisations.id`;

    const [stageWithStageMessages] =
      await this.database.query<StageWithStageMessagesDTO>(query, [
        stageId,
        false,
        true,
      ]);

    return stageWithStageMessages;
  }

  async getExistingStage(
    stageType: StageType,
    organisationId: string,
    treatment_option_id?: string,
    ageGroups?: string[],
    stageId?: string,
  ): Promise<Stage> {
    let query = `SELECT *
    FROM stages
    WHERE stage_type = $1
      AND organisation_id = $2
      AND is_active=$3
      AND is_deleted=$4`;
    const param: unknown[] = [stageType, organisationId, true, false];
    if (treatment_option_id) {
      query += `AND treatment_option_id = $${param.length + 1}`;
      param.push(treatment_option_id);
    }
    if (ageGroups?.length) {
      query += `AND age_group = $${param.length + 1}`;
      param.push(ageGroups);
    }
    if (stageId) {
      query += `AND id <> $${param.length + 1}`;
      param.push(stageId);
    }
    const [stage] = await this.database.query<Stage>(query, param);
    return stage;
  }

  async insertStage(input: InsertStageInput): Promise<Stage> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO stages (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [stage] = await this.database.query<Stage>(query, values);
    return stage;
  }

  async insertStageMessage(
    input: InsertStageMessageInput[],
  ): Promise<StageMessages[]> {
    const keys = Object.keys(input[0]);
    const columns = keys.join(',');
    const values = input
      .map(
        (stageMessage) =>
          `(${Object.values(stageMessage)
            .map((value) => `'${value}'`)
            .join(', ')})`,
      )
      .join(', ');
    const query = `INSERT INTO stage_messages (${columns}) VALUES ${values} RETURNING *`;

    const [stageMessages] = await this.database.batchQuery<StageMessages>(
      query,
    );

    return stageMessages;
  }

  async getStageById(stageId: string): Promise<Stage> {
    const query =
      'SELECT * FROM stages WHERE id = $1 AND is_active=$2 AND is_deleted=$3';
    const [stage] = await this.database.query<Stage>(query, [
      stageId,
      true,
      false,
    ]);
    return stage;
  }

  async getStageMessageById(stageId: string): Promise<StageMessages[]> {
    const query =
      'SELECT * FROM stage_messages WHERE stage_id = $1 AND is_deleted=$2';
    const stageMessages = await this.database.query<StageMessages>(query, [
      stageId,
      false,
    ]);
    return stageMessages;
  }

  async updateStageMessageById(
    stageMessageId: string,
    updates: UpdateStageMessagesInput,
  ): Promise<StageMessages> {
    const parameters = [...Object.values(updates), stageMessageId];
    const query =
      'UPDATE stage_messages SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;
    const [updatedStage] = await this.database.query<StageMessages>(
      query,
      parameters,
    );

    return updatedStage;
  }

  async deleteStageMessage(stageMessageId: string): Promise<StageMessages> {
    const query = `UPDATE stage_messages SET is_deleted=$1 WHERE id=$2 ;`;
    const [stageMessage] = await this.database.query<StageMessages>(query, [
      true,
      stageMessageId,
    ]);
    return stageMessage;
  }

  async updateStageById(
    stageId: string,
    updates: StageUpdateDto,
  ): Promise<Stage> {
    const parameters = [...Object.values(updates), stageId];
    const query =
      'UPDATE stages SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;
    const [updatedStage] = await this.database.query<Stage>(query, parameters);

    return updatedStage;
  }

  async getToolkitCount(toolkitsIds: string[]): Promise<number> {
    const query = `SELECT COUNT(*) FROM tool_kits WHERE id = ANY($1::uuid[])`;
    const [{ count }] = await this.database.query<{ count: string }>(query, [
      toolkitsIds,
    ]);
    return Number(count);
  }

  async getTreatmentUser(userId: string): Promise<TreatmentUserDTO> {
    const query = `SELECT treatments.option_id as treatment_option_id,
    treatments.id as treatment_id,
    users.age_group ,
    users.organization_id
    FROM treatments 
    LEFT JOIN users ON users.id=treatments.user_id
    WHERE treatments.user_id=$1 AND treatments.is_deleted = $2 ;`;
    const [treatment] = await this.database.query<TreatmentUserDTO>(query, [
      userId,
      false,
    ]);
    return treatment;
  }

  async getStageWithMessage(
    stageType: string,
    organisationId: string,
    treatment_option_id: string,
    ageGroups: string,
  ): Promise<StageWithStageMessageDTO> {
    const query = `SELECT stages.*,
    json_agg(stage_messages.*) AS stage_messages
    FROM stages
    LEFT JOIN stage_messages ON stage_messages.stage_id=stages.id
    WHERE stage_type = $1
      AND organisation_id = $2 AND treatment_option_id =$3 AND $4=ANY(stages.age_group) AND stage_messages.is_deleted=$5 AND stages.is_active=$6 AND stages.is_deleted=$5
      GROUP BY
    stages.id`;
    const [stage] = await this.database.query<StageWithStageMessageDTO>(query, [
      stageType,
      organisationId,
      treatment_option_id,
      ageGroups,
      false,
      true,
    ]);
    return stage;
  }

  async insertTreatmentFile(
    input: InsertTreatmentFileInput,
  ): Promise<TreatmentTimelineAttachment> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO treatment_timeline_attachments (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [treatmentFile] =
      await this.database.query<TreatmentTimelineAttachment>(query, values);
    return treatmentFile;
  }

  async insertTreatmentTimeline(
    input: InsertTreatmentTimeline[],
  ): Promise<TreatmentTimeline[]> {
    const keys = Object.keys(input[0]);
    const columns = keys.join(',');
    const values = input
      .map(
        (treatmentTimeline) =>
          `(${Object.values(treatmentTimeline)
            .map((value) => `'${value}'`)
            .join(', ')})`,
      )
      .join(', ');
    const query = `INSERT INTO treatment_timeline (${columns}) VALUES ${values} RETURNING *`;
    const newTreatmentTimelines =
      await this.database.batchQuery<TreatmentTimeline>(query);
    return newTreatmentTimelines.map(
      (treatmentTimeline) => treatmentTimeline[0],
    );
  }

  async getTreatmentWithUser(
    treatmentId: string,
  ): Promise<TreatmentWithUserDTO> {
    const query = `SELECT treatments.option_id as treatment_option_id,
    treatments.id as treatment_id,
    treatments.user_id as user_id,
    treatments.created_at AS treatment_start_date,
    users.age_group ,
    users.organization_id
    FROM treatments
    LEFT JOIN users ON users.id=treatments.user_id
    WHERE treatments.id=$1`;
    const [treatment] = await this.database.query<TreatmentWithUserDTO>(query, [
      treatmentId,
    ]);
    return treatment;
  }

  async getCompletedStageMessageIds(
    treatmentId: string,
    stageType: StageType,
  ): Promise<{ stage_message_ids: string[] }> {
    const query = `SELECT COALESCE(ARRAY_AGG(treatment_timeline.stage_message_id), '{}'::uuid[]) AS stage_message_ids
    FROM treatment_timeline
    WHERE treatment_timeline.treatment_id = $1
      AND treatment_timeline.stage_type = $2 ;`;
    const [response] = await this.database.query<{
      stage_message_ids: string[];
    }>(query, [treatmentId, stageType]);
    return response;
  }

  async getBuddyWithTreatment(id: string): Promise<Treatment> {
    const query = 'SELECT * FROM treatments WHERE id = $1';
    const [treatment] = await this.database.query<Treatment>(query, [id]);
    return treatment;
  }

  async getToolkitById(toolkitId: string): Promise<Toolkit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [toolkit] = await this.database.query<Toolkit>(query, [toolkitId]);
    return toolkit;
  }

  async insertTreatmentNote(
    input: InsertTreatmentNoteInput,
  ): Promise<TreatmentTimelineAttachment> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO treatment_timeline_attachments (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [treatmentNote] =
      await this.database.query<TreatmentTimelineAttachment>(query, values);
    return treatmentNote;
  }

  private scheduleGoalJoins(): {
    query: string;
    columm: string;
  } {
    const { joins, column } = Array.from(toolKitUserOptionTables)
      .map((name) => name.slice(0, name.length - 1))
      .reduce(
        (agg, tableName) => {
          agg.joins += `LEFT JOIN ${tableName}  ON ${tableName}.schedule_id=schedules.id
        `;
          agg.column += `WHEN ${tableName}.schedule_id=schedules.id THEN ${tableName}.id
          `;
          return agg;
        },
        {
          joins: '',
          column: `
        `,
        },
      );
    const finalColumn = `CASE
      ${column}
      ELSE NULL END AS goal_id
      `;
    return { query: joins, columm: finalColumn };
  }

  private scheduleAnswerJoins(): {
    query: string;
    columm: string;
  } {
    const checkins = [
      ToolkitType.STEPS,
      ToolkitType.SLEEP_CHECK,
      ToolkitType.BLOOD_PRESSURE,
      ToolkitType.HEART_RATE,
      ToolkitType.WEIGHT,
      ToolkitType.MEDICATION,
      ToolkitType.MOOD,
      ToolkitType.ADDICTION_LOG,
      ToolkitType.SYMPTOMS_LOG,
      ToolkitType.EMOTION_SYMPTOMS_LOG,
      ToolkitType.ANXIETY_SYMPTOMS_LOG,
      ToolkitType.SUSPICIUS_SYMPTOMS_LOG,
      ToolkitType.FORCED_ACTION_SYMPTOMS_LOG,
      ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG,
    ];
    const { joins, column } = checkins.reduce(
      (agg, checkin) => {
        const tableName = toolkitAnswerTables.get(checkin);
        if (tableName) {
          if (checkin !== ToolkitType.MOOD) {
            agg.joins += `
        LEFT JOIN (
            SELECT schedule_id,MIN(session_time) AS session_time,json_agg(${tableName}.*) AS answers FROM ${tableName} WHERE session_date=treatment_timeline.created_at::date GROUP BY schedule_id ORDER BY session_time DESC
          ) ${tableName} ON ${tableName}.schedule_id=schedules.id
        `;
          }

          if (checkin === ToolkitType.MOOD) {
            agg.joins += `
            LEFT JOIN (
                SELECT schedule_id,MIN(session_time) AS session_time,json_agg(
                    json_build_object('answer',${tableName}.*,'mood_check_category',mood_check_categories.*)) AS answers  FROM ${tableName}
                JOIN mood_check_categories ON mood_check_categories.id=${tableName}.mood_category_id
                WHERE session_date=treatment_timeline.created_at::date GROUP BY schedule_id ORDER BY session_time DESC
              ) ${tableName} ON ${tableName}.schedule_id=schedules.id
            `;
          }

          agg.column += `WHEN ${tableName}.schedule_id=schedules.id THEN ${tableName}.answers
          `;
        }
        return agg;
      },
      { joins: '', column: '' },
    );
    const finalColumn = `CASE
    ${column}
    ELSE NULL END AS entries
    `;
    return { query: joins, columm: finalColumn };
  }
  //TODO: Check logic for is completed, translation and forms sorting
  private getUserAppointmentJoin(lang: string): string {
    return ` LEFT JOIN LATERAL (
      SELECT
  user_appointments.*,
  ROW_TO_JSON(doctor.*) AS doctor,
  ROW_TO_JSON(users.*) AS users,
  COALESCE(
    (
      SELECT
        JSON_AGG(forms.*)
      FROM
        (
          SELECT
            forms.id,
            forms.hlp_reward_points,
            CASE
            WHEN forms.id = schedules.session_form_id
            THEN true
            ELSE false
            END AS is_session_form,
            CASE
            WHEN forms.id = schedules.complaint_form_id
            THEN true
            ELSE false
            END AS is_complaint_form,
            CASE
              WHEN forms.translations->> '${lang}' IS NOT NULL
              THEN (forms.translations->> '${lang}' )::json->>'title'
              ELSE forms.title
              END AS title,
            CASE
              WHEN user_form_answers.id IS NOT NULL THEN true
              ELSE false
            END AS is_completed
          FROM
            forms
            LEFT JOIN user_form_answers ON user_form_answers.form_id = forms.id
            AND user_form_answers.schedule_id = schedules.id  
            AND user_form_answers.user_appointment_id = schedules.user_appointment_id
            AND user_form_answers.session_date = treatment_timeline.created_at::date
          WHERE
            forms.id = schedules.session_form_id 
            OR forms.id = schedules.complaint_form_id 
          ORDER BY
            forms.created_at DESC ---fix sorting later
        ) AS forms
    ),
    '[]'
  ) AS appointment_forms
FROM
  user_appointments
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.avatar_image_name,
      users.avatar,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role
    FROM
      users
    WHERE
      user_appointments.user_id = users.id
  ) AS users ON true
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.image_url,
      users.image_id,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role,
      users.file_path
    FROM
      users
    WHERE
      user_appointments.doctor_id = users.id
  ) AS doctor ON true
WHERE
  user_appointments.id = schedules.user_appointment_id
    ) AS user_appointment ON true`;
  }

  getScheduleWithAnswersQuery(lang: string): string {
    const { query: scheduleGoalJoins, columm: scheduleGoalColumn } =
      this.scheduleGoalJoins();
    const { query: scheduleAnswerJoins, columm: scheduleAnswerColumn } =
      this.scheduleAnswerJoins();
    const userAppointmentJoin = this.getUserAppointmentJoin(lang);

    const scheduleQuery = `
    SELECT schedules.*,schedules.repeat_per_day AS total_sessions,
    COALESCE(completed_sessions,0)::INTEGER as completed_sessions,
    COALESCE(schedule_reminders.reminders,'[]') AS reminders,
    COALESCE(toolkit_streaks.streaks_count,0)::INTEGER AS streaks_count,
    row_to_json(tool_kits.*) AS toolkit,
    row_to_json(challenges.*) As challenge,
    user_schedule_sessions.session_id,
    row_to_json(user_appointment) As user_appointment,
    COALESCE(user_form_answers.form_session_ids, '[]') AS form_session_ids,

    -- completed
    CASE
    WHEN completed_sessions>=repeat_per_day THEN true ELSE false
    END AS completed,

    -- last session id
    CASE
    WHEN completed_sessions >= repeat_per_day THEN 
        (SELECT session_id 
         FROM user_schedule_sessions 
         WHERE session_date = treatment_timeline.created_at::date 
           AND user_schedule_sessions.schedule_id = schedules.id 
         ORDER BY created_at DESC 
         LIMIT 1)
    ELSE NULL
    END AS last_session_id,

    -- goal_id(selected options)
    ${scheduleGoalColumn},

    -- toolkit answers
    ${scheduleAnswerColumn}

    FROM schedules

    -- toolkits with unit
    LEFT JOIN (SELECT tool_kits.*,row_to_json(units.*) As unit FROM tool_kits JOIN units ON units.id=tool_kits.unit
    ) tool_kits ON tool_kits.id=schedules.tool_kit AND tool_kits.tool_kit_type!='${ToolkitType.HABIT}'

 -- streaks
    LEFT JOIN(SELECT tool_kit,count(toolkit_streaks.*) AS streaks_count FROM toolkit_streaks  GROUP BY tool_kit) toolkit_streaks ON toolkit_streaks.tool_kit=schedules.tool_kit

    -- challenge
    LEFT JOIN challenges ON schedules.challenge_id IS NOT NULL AND schedules.challenge_id=challenges.id


    -- reminders
    LEFT JOIN (SELECT schedule_id,json_agg(schedule_reminders.*) AS reminders FROM schedule_reminders GROUP BY schedule_id) schedule_reminders ON schedule_reminders.schedule_id=schedules.id

    -- schedule sessions
   LEFT JOIN (SELECT schedule_id,MAX(created_at) AS created_at,MAX(id::text) as session_id, COUNT(*) as completed_sessions FROM user_schedule_sessions WHERE session_date=treatment_timeline.created_at::date GROUP BY schedule_id) user_schedule_sessions ON user_schedule_sessions.schedule_id=schedules.id


   
---form_session_ids
LEFT JOIN LATERAL(
  SELECT 
    json_agg(user_form_answers.session_id) AS form_session_ids
  FROM user_form_answers
  WHERE user_form_answers.schedule_id = schedules.id AND user_form_answers.session_date =treatment_timeline.created_at::date
) AS user_form_answers ON true

   -- options joins
   ${scheduleGoalJoins}

  -- answer joins
  ${scheduleAnswerJoins}

  ---user_appointments
${userAppointmentJoin}

  WHERE schedules.id=treatment_timeline.schedule_id
  ORDER BY completed
 
    `;

    return scheduleQuery;
  }

  getTreattmentTimelineFilterConditions(
    filters: TreatementTimelineFilter,
  ): string[] {
    const filterConditions: string[] = [];

    if (filters.show_coaches) {
      const placeHolders = StageType.COACHES;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }

    if (filters.show_activity) {
      const placeHolders = StageType.ACTIVITY;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }

    if (filters.show_forms) {
      const placeHolders = StageType.FORMS;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }
    if (filters.show_tools) {
      const placeHolders = StageType.TOOL_KIT;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }
    if (filters.show_groups) {
      const placeHolders = StageType.GROUP;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }
    if (filters.show_files) {
      const placeHolders = StageType.FILE;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }
    if (filters.show_private_notes) {
      const placeHolders = StageType.NOTE;
      filterConditions.push(
        `treatment_timeline.stage_type= '${placeHolders}' AND attachments.is_private_note =true`,
      );
    }
    if (filters.show_session_notes) {
      const placeHolders = StageType.NOTE;
      filterConditions.push(
        `treatment_timeline.stage_type= '${placeHolders}' AND attachments.is_private_note =false`,
      );
    }
    if (filters.show_appointment) {
      if (StageType.INTAKE_APPOINTMENT) {
        const placeHolders = StageType.INTAKE_APPOINTMENT;
        filterConditions.push(
          `treatment_timeline.stage_type= '${placeHolders}'`,
        );
      }
      if (StageType.RESEARCH_APPOINTMENT) {
        const placeHolders = StageType.RESEARCH_APPOINTMENT;
        filterConditions.push(
          `treatment_timeline.stage_type= '${placeHolders}'`,
        );
      }
      if (StageType.OTHER_APPOINTMENT) {
        const placeHolders = StageType.OTHER_APPOINTMENT;
        filterConditions.push(
          `treatment_timeline.stage_type= '${placeHolders}'`,
        );
      }
    }
    if (filters.show_logs) {
      const placeHolders = StageType.SLEEP_CHECK;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }
    if (filters.show_message) {
      const placeHolders = StageType.DEFAULT;
      filterConditions.push(`treatment_timeline.stage_type= '${placeHolders}'`);
    }
    if (filters.show_team) {
      const placeHolders = [StageType.BUDDY, StageType.COACHES];
      filterConditions.push(
        `treatment_timeline.stage_type IN ('${placeHolders.join("','")}')`,
      );
    }
    return filterConditions;
  }

  async getTreatmentTimeline(args: GetTreatmentTimelineDTO): Promise<{
    treatmentTimeline: TreatementTimelineDTO[];
    total: number;
  }> {
    const { limit, page, lang, filters } = args;
    const offset = (page - 1) * limit;
    const scheduleWithAnswersQuery = this.getScheduleWithAnswersQuery(lang);
    let commonQuery = `
    FROM
  treatment_timeline
  LEFT JOIN stage_messages ON treatment_timeline.stage_message_id = stage_messages.id

  LEFT JOIN LATERAL (
    SELECT
      tool_kits.*
    FROM
      tool_kits
    WHERE
      stage_messages.toolkit_id = tool_kits.id
  ) AS tool_kits ON true

  LEFT JOIN LATERAL (
    SELECT
      treatment_timeline_attachments.*
    FROM
      treatment_timeline_attachments
    WHERE
      treatment_timeline.attachment_id = treatment_timeline_attachments.id
      
  ) AS attachments ON true
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.avatar_image_name,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role,
      users.avatar_type,
      users.file_path,
      treatment_timeline.treatment_doctor_role
    FROM
      users
    WHERE
      treatment_timeline.treatment_team_member_id = users.id
  ) AS treatment_team_member ON true

  LEFT JOIN LATERAL (
    ${scheduleWithAnswersQuery}
  ) AS schedule_with_answers ON true

WHERE treatment_timeline.is_deleted = $1
   ${
     args.loggedInUserRole === UserRoles.USER
       ? `AND (attachments.is_private_note = false OR attachments IS NULL)`
       : ``
   }
    `;

    //add filters query
    if (filters) {
      const filterConditions =
        this.getTreattmentTimelineFilterConditions(filters);

      if (filterConditions.length) {
        commonQuery += ` AND (${filterConditions.join(' OR ')})`;
      }
    }

    if (args.treatmentId) {
      commonQuery += ` AND treatment_timeline.treatment_id = '${args.treatmentId}'`;
    } else {
      commonQuery += ` AND treatment_timeline.user_id = '${args.userId}'`;
    }

    const queryWithoutPagination = `SELECT 
          CAST(COALESCE(COUNT(treatment_timeline.id),'0') AS INTEGER) AS total ${commonQuery} `;

    const query = `
    SELECT
  treatment_timeline.id,
  treatment_timeline.user_id,
  treatment_timeline.stage_type,
  treatment_timeline.treatment_id,
  CASE
    WHEN stage_messages.translations->> $2 IS NOT NULL
    THEN (stage_messages.translations->> $2 )::json->>'message'
    ELSE (stage_messages.translations->>'nl')::json->>'message'
  END AS message,
  ROW_TO_JSON(tool_kits.*) as toolkit,
  ROW_TO_JSON(treatment_team_member) AS treatment_team_member,
  ROW_TO_JSON(attachments.*) as attachments,
  ROW_TO_JSON(schedule_with_answers.*) as schedule_with_answers,
  treatment_timeline.created_at
    ${commonQuery}
    ORDER BY
  treatment_timeline.created_at DESC
    LIMIT $3 OFFSET $4`;
    const [treatmentTimeline, [{ total }]] = await Promise.all([
      this.database.query<TreatementTimelineDTO>(query, [
        false,
        lang,
        limit,
        offset,
      ]),
      this.database.query<{ total: number }>(queryWithoutPagination, [false]),
    ]);
    return { treatmentTimeline, total };
  }

  async getTreatmentByUserId(userId: string): Promise<Treatment> {
    const query = `SELECT treatments.* 
    FROM treatments WHERE treatments.user_id=$1 AND treatments.is_deleted = $2 ;`;
    const [treatment] = await this.database.query<Treatment>(query, [
      userId,
      false,
    ]);
    return treatment;
  }

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getActiveTreatmentWithDoctorRole(
    organisationId: string,
    treatment_option_id: string,
    ageGroup: string[],
  ): Promise<TreatmentWithDoctorRole[]> {
    const query = `SELECT
    treatments.*,
    doctor_treatments.role,
    doctor_treatments.doctor_id
  FROM
    treatments
    LEFT JOIN users ON treatments.user_id = users.id
    LEFt JOIN doctor_treatments ON treatments.id = doctor_treatments.treatment_id
    AND doctor_treatments.is_owner = $4
  WHERE
    treatments.option_id = $1
    AND users.organization_id = $2
    AND users.age_group = ANY(ARRAY[${ageGroup
      .map((age) => `'${age}'`)
      .join(',')}])
    AND treatments.is_deleted = $3
     AND doctor_treatments.is_deleted = $3`;
    const treatments = await this.database.query<TreatmentWithDoctorRole>(
      query,
      [treatment_option_id, organisationId, false, true],
    );
    return treatments;
  }

  async saveSchedule(
    saveSchedule: SaveScheduleInput[],
  ): Promise<ScheduleEntity[]> {
    const keys = Object.keys(saveSchedule[0]);
    const columns = keys
      .map((key) => (key === 'user' ? `"${key}"` : key))
      .join(', ');
    const values = saveSchedule
      .map(
        (schedule) =>
          `(${Object.values(schedule)
            .map((value) => `'${value}'`)
            .join(', ')})`,
      )
      .join(', ');
    const query = `INSERT INTO schedules (${columns}) VALUES ${values} RETURNING *`;
    const schedules = await this.database.batchQuery<ScheduleEntity>(query);
    return schedules.map((schdule) => schdule[0]);
  }

  async getAppointmentWithUser(
    id: string,
    userId: string,
  ): Promise<UserAppointment> {
    const query =
      'SELECT * FROM user_appointments WHERE id = $1 AND user_id=$2';
    const [appointment] = await this.database.query<UserAppointment>(query, [
      id,
      userId,
    ]);
    return appointment;
  }

  async deleteTreatmentTimelineMessage(
    treatmentTimelineId: string,
  ): Promise<TreatmentTimeline> {
    const query = `UPDATE treatment_timeline SET is_deleted = $1 WHERE id = $2 RETURNING *`;
    const [disabledTreatmentTimeline] =
      await this.database.query<TreatmentTimeline>(query, [
        true,
        treatmentTimelineId,
      ]);
    return disabledTreatmentTimeline;
  }

  async disableSchedule(
    scheduleId: string,
    date: string,
    logedInUser: string,
  ): Promise<ScheduleEntity> {
    const query = `UPDATE schedules SET is_schedule_disabled=$1, end_date=$2, updated_by=$3  WHERE schedules.id=$4 RETURNING *`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [
      true,
      date,
      logedInUser,
      scheduleId,
    ]);
    return schedule;
  }

  async getDoctorTreatment(
    doctorId: string,
    treatmentId: string,
  ): Promise<DoctorTreatment> {
    const query = `SELECT * FROM doctor_treatments  
    WHERE doctor_treatments.doctor_id=$1 
    AND doctor_treatments.treatment_id = $2 
    AND doctor_treatments.is_deleted = $3;`;
    const [treatment] = await this.database.query<DoctorTreatment>(query, [
      doctorId,
      treatmentId,
      false,
    ]);
    return treatment;
  }

  async getTreatmentTimelineMessage(
    treatmentTimelineMessageId: string,
  ): Promise<TreatmentTimeline> {
    const query = `SELECT * FROM treatment_timeline  
    WHERE treatment_timeline.id=$1 
    AND treatment_timeline.is_deleted = $2;`;
    const [treatmentTimeline] = await this.database.query<TreatmentTimeline>(
      query,
      [treatmentTimelineMessageId, false],
    );
    return treatmentTimeline;
  }

  async getTreatmentTimelineAttachmentWithType(
    id: string,
    timelineAttachmentType: TimelineAttachmentType,
  ): Promise<TreatmentTimelineAttachment> {
    const query =
      'SELECT * FROM treatment_timeline_attachments WHERE id = $1 and type=$2';
    const [treatmentTimelineAttachment] =
      await this.database.query<TreatmentTimelineAttachment>(query, [
        id,
        timelineAttachmentType,
      ]);
    return treatmentTimelineAttachment;
  }

  async updateTreatmentTimelineAttachmentById(
    attachmentId: string,
    updates: UpdateTreatmentTimelineNote | UpdateTreatmentTimelineFile,
  ): Promise<TreatmentTimelineAttachment> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE treatment_timeline_attachments SET ${setFields} WHERE id = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, attachmentId];

    const [treatmentTimelineAttachment] =
      await this.database.query<TreatmentTimelineAttachment>(
        query,
        updateValues,
      );

    return treatmentTimelineAttachment;
  }

  async getTreatmentSchedule(
    scheduleId: string,
    treatmentId: string,
  ): Promise<ScheduleEntity> {
    const query = `SELECT * FROM schedules WHERE schedules.id=$1 AND schedules.treatment_id=$2 `;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [
      scheduleId,
      treatmentId,
    ]);
    return schedule;
  }

  async getTreatmentTimelineWithAttachment(
    id: string,
    timelineAttachmentType: TimelineAttachmentType,
  ): Promise<TreatmentTimelineAttachment> {
    const query = `SELECT treatment_timeline_attachments.*
      FROM treatment_timeline
      LEFT JOIN treatment_timeline_attachments ON treatment_timeline_attachments.id=treatment_timeline.attachment_id
      WHERE treatment_timeline.id=$1 AND treatment_timeline_attachments.type=$2`;
    const [treatmentTimelineAttachment] =
      await this.database.query<TreatmentTimelineAttachment>(query, [
        id,
        timelineAttachmentType,
      ]);
    return treatmentTimelineAttachment;
  }
}
