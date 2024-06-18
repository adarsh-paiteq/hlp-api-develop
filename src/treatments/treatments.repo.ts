import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { Treatment } from './entities/treatments.entity';
import { DoctorTreatment } from './entities/doctor-treatments.entity';
import { DoctorTreatmentDto, TreatmentRoles } from './dto/add-treatment.dto';
import { TreatmentOption } from './entities/treatment-options.entity';
import { GetTreatmentTeamResponse } from './dto/get-treatment-team.dto';
import { TreatmentBuddy } from './entities/treatment-buddy.entity';
import { TreatmentBuddyInput } from './dto/add-treatment-buddy.dto';
import { Doctor } from '../doctors/entities/doctors.entity';
import { Users } from '@users/users.model';
import { UserRoles } from '@users/users.dto';
import { TreatmentPatientComplaint } from './entities/treatment-patient-complaints.entity';
import { TreatmentPatientComplaintDTO } from './dto/update-treatment-complaints.dto';
import { TreatmentProfileDto } from './dto/get-user-treatment-profile.dto';
import { TreatmentComplaint } from './entities/treatment-complaints.entity';
import { GetUserTreatmentTeamResponse } from './dto/get-user-treatment-team.dto';
import { UserTreatmentProfileDto } from './dto/get-treatment-profile.dto';
import { DoctorListData } from './dto/get-treatment-doctor-list.dto';
import { PatientsListData } from './dto/get-doctor-patients-list.dto';
import {
  TermsAndConditionsAndPrivacyPolicy,
  TreatmentAndUserDTO,
  TreatmentDoctorData,
  UserGoalsWithGoalLevel,
  UserTreatmentAppointment,
  UserTreatmentTimelineNote,
} from './dto/download-treatment-file.dto';
import { ScheduleFor } from '@schedules/entities/schedule.entity';
import { StageType } from '@treatment-timeline/entities/stage.entity';
import { TreatmentType } from './enum/treatments.enum';
import { Chat } from '@chats/entities/chat.entity';

import { UpdateTreatmentUserProfileDto } from './dto/update-treatment-user-profile.dto';
import {
  PaitentInvitationStatus,
  PatientInvitation,
} from '@invitations/entities/patient-invitations.entity';

@Injectable()
export class TreatmentsRepo {
  constructor(private readonly database: Database) {}

  async getTreatment(userId: string): Promise<Treatment | null> {
    const query = `SELECT * FROM treatments WHERE user_id = $1 AND is_deleted = $2`;
    const [treatment] = await this.database.query<Treatment>(query, [
      userId,
      false,
    ]);
    return treatment;
  }

  async addTreatment(
    userId: string,
    optionId: string,
    treatment_type: TreatmentType,
    hasParticiapatedInStartProgram: boolean,
  ): Promise<Treatment> {
    const query = `INSERT INTO treatments (user_id,option_id,treatment_type,has_participated_in_start_program) VALUES($1,$2,$3,$4) RETURNING *; `;
    const [treatment] = await this.database.query<Treatment>(query, [
      userId,
      optionId,
      treatment_type,
      hasParticiapatedInStartProgram,
    ]);
    return treatment;
  }

  async addDoctorTreatment(
    doctorTreatment: DoctorTreatmentDto,
  ): Promise<DoctorTreatment> {
    const query = `INSERT INTO doctor_treatments (${Object.keys(
      doctorTreatment,
    )}) VALUES (${Object.keys(doctorTreatment).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;

    const [saveDoctorTreatment] = await this.database.query<DoctorTreatment>(
      query,
      Object.values(doctorTreatment),
    );
    return saveDoctorTreatment;
  }

  async getUserById(id: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<Users>(query, [id]);
    return user;
  }

  async getTreatmentOptionById(id: string): Promise<TreatmentOption> {
    const query = `SELECT * FROM treatment_options WHERE id=$1`;
    const [treatmentOption] = await this.database.query<TreatmentOption>(
      query,
      [id],
    );
    return treatmentOption;
  }

  async getDoctorTreatment(
    treatmentId: string,
    doctorId: string,
  ): Promise<DoctorTreatment> {
    const query = `SELECT * FROM doctor_treatments where treatment_id=$1 AND doctor_id=$2 AND is_deleted=false `;
    const [doctorTreatment] = await this.database.query<DoctorTreatment>(
      query,
      [treatmentId, doctorId],
    );
    return doctorTreatment;
  }

  async getTreatmentById(id: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE id=$1 AND is_deleted = $2`;
    const [treatment] = await this.database.query<Treatment>(query, [
      id,
      false,
    ]);
    return treatment;
  }

  async getdoctorTreatmentById(id: string): Promise<DoctorTreatment> {
    const query = `SELECT * FROM doctor_treatments WHERE id=$1 AND is_deleted = $2`;
    const [doctorTreatment] = await this.database.query<DoctorTreatment>(
      query,
      [id, false],
    );
    return doctorTreatment;
  }

  async deleteDoctorTreatment(
    id: string,
    doctorId: string,
  ): Promise<DoctorTreatment> {
    const query = `UPDATE doctor_treatments SET is_deleted=true, updated_by = $1  WHERE id=$2 RETURNING *;`;
    const [doctorTreatment] = await this.database.query<DoctorTreatment>(
      query,
      [doctorId, id],
    );
    return doctorTreatment;
  }

  async updateTreatmentArchiveStatus(
    doctorTreatmentId: string,
    is_archived: boolean,
    doctorId: string,
  ): Promise<DoctorTreatment> {
    const query = `UPDATE doctor_treatments SET is_archived=$1, updated_by = $2 WHERE id=$3 RETURNING *;`;
    const [doctorTreatment] = await this.database.query<DoctorTreatment>(
      query,
      [is_archived, doctorId, doctorTreatmentId],
    );
    return doctorTreatment;
  }

  async getTreatmentTeam(
    treatmentId: string,
  ): Promise<GetTreatmentTeamResponse> {
    const query = `SELECT
    ROW_TO_JSON(treatments.*) AS treatment,
    COALESCE(
        (
            SELECT JSON_AGG(doctor_coach.*)
            FROM (
                SELECT
                    doctor_users.id,
                    doctor_users.first_name,
                    doctor_users.last_name,
                    doctor_users.user_name,
                    doctor_users.image_url,
                    doctor_users.image_id,
                    doctor_users.file_path,
                    doctor_treatments.treatment_id,
                    doctor_treatments.id AS doctor_treatment_id,
                    doctor_treatments.role AS doctor_treatment_role,
                    doctor_treatments.is_owner
                FROM
                    doctor_treatments
                    LEFT JOIN users AS doctor_users ON doctor_treatments.doctor_id = doctor_users.id
                WHERE
                    doctor_treatments.is_deleted = false
                    AND is_archived = false
                    AND treatments.id = doctor_treatments.treatment_id
            ) AS doctor_coach
        ),
        '[]'
    ) AS coaches,
    COALESCE(
        (
            SELECT JSON_AGG(buddy.*)
            FROM (
                SELECT
                    users.id,
                    users.full_name,
                    users.first_name,
                    users.last_name,
                    users.user_name,
                    users.avatar_image_name,
                    treatment_buddies.id AS treatment_buddy_id,
                    treatment_buddies.treatment_id
                FROM
                    treatment_buddies
                    LEFT JOIN users ON treatment_buddies.user_id = users.id
                WHERE
                    treatment_buddies.is_deleted = false
                    AND treatments.id = treatment_buddies.treatment_id
            ) AS buddy
        ),
        '[]'
    ) AS buddies
  FROM
      treatments
  WHERE
      treatments.id = $1
      AND treatments.is_deleted = $2
  GROUP BY
      treatments.id;`;
    const [treatmentTeam] = await this.database.query<GetTreatmentTeamResponse>(
      query,
      [treatmentId, false],
    );
    return treatmentTeam;
  }

  async addTreatmentBuddy(
    treatmentBuddyInput: TreatmentBuddyInput,
  ): Promise<TreatmentBuddy> {
    const keys = Object.keys(treatmentBuddyInput);
    const values = Object.values(treatmentBuddyInput);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO treatment_buddies (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [treatmentBuddy] = await this.database.query<TreatmentBuddy>(
      query,
      values,
    );
    return treatmentBuddy;
  }

  async getTreatmentBuddy(
    treatmentId: string,
    buddyId: string,
  ): Promise<TreatmentBuddy> {
    const query = `SELECT * FROM treatment_buddies WHERE treatment_id = $1 AND user_id = $2 AND is_deleted = $3 ;`;
    const [treatmentBuddy] = await this.database.query<TreatmentBuddy>(query, [
      treatmentId,
      buddyId,
      false,
    ]);
    return treatmentBuddy;
  }

  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    const query = `SELECT * FROM users WHERE id = $1 `;
    const [doctor] = await this.database.query<Doctor>(query, [doctorId]);

    return doctor;
  }

  async getUnassignedTreatmentDoctors(
    page: number,
    limit: number,
    organizationId: string,
    treatmentId: string,
    text?: string,
  ): Promise<{ doctors: Doctor[]; total: number }> {
    const offset = (page - 1) * limit;
    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total
    FROM users
    WHERE
        NOT EXISTS (
            SELECT *
            FROM doctor_treatments
            WHERE doctor_treatments.doctor_id = users.id
              AND doctor_treatments.treatment_id = $1 AND doctor_treatments.is_deleted = false
        )
        AND users.organization_id = $2
        AND users.is_onboarded = true
        AND users.role = $3`;
    const paramsWithoutPagination: unknown[] = [
      treatmentId,
      organizationId,
      UserRoles.DOCTOR,
    ];
    if (text) {
      queryWithoutPagination += `AND (first_name ILIKE $4 OR last_name ILIKE $4 OR email ILIKE $4 OR user_name ILIKE $4)`;
      paramsWithoutPagination.push(`%${text}%`);
    }

    let queryWithPagination = `SELECT  users.*
    FROM users
    WHERE
        NOT EXISTS (
            SELECT *
            FROM doctor_treatments
            WHERE doctor_treatments.doctor_id = users.id
              AND doctor_treatments.treatment_id = $1 AND doctor_treatments.is_deleted = false
        )
        AND users.organization_id = $2
        AND users.is_onboarded = true
        AND users.role = $3`;
    const paramsWithPagination: unknown[] = [
      treatmentId,
      organizationId,
      UserRoles.DOCTOR,
    ];

    if (text) {
      queryWithPagination += `AND (first_name ILIKE $4 OR last_name ILIKE $4 OR email ILIKE $4 OR user_name ILIKE $4)
        ORDER BY created_at DESC LIMIT $5 OFFSET $6`;
      paramsWithPagination.push(`%${text}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(limit, offset);
    }

    const [[{ total }], doctors] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<Doctor>(queryWithPagination, paramsWithPagination),
    ]);

    return { doctors, total };
  }

  async deleteTreatmentBuddy(treatmentBodyId: string): Promise<TreatmentBuddy> {
    const query = `DELETE FROM treatment_buddies WHERE id = $1 RETURNING *;`;
    const [treatmentBuddy] = await this.database.query<TreatmentBuddy>(query, [
      treatmentBodyId,
    ]);
    return treatmentBuddy;
  }
  async getUnassignedTreatmentBuddies(
    page: number,
    limit: number,
    treatmentId: string,
    userId: string,
    search?: string,
  ): Promise<{ buddies: Users[]; total: number }> {
    const offset = (page - 1) * limit;
    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(DISTINCT users.*), '0') AS INTEGER) AS total
  FROM
    user_friends
    LEFT JOIN
    users ON users.id = user_friends.friend_id AND user_friends.user_id= $1
  WHERE
    NOT EXISTS (
      SELECT 1
      FROM
        treatment_buddies
      WHERE
        treatment_buddies.user_id = user_friends.friend_id
        AND treatment_buddies.treatment_id = $2 AND treatment_buddies.is_deleted = false
    )
    AND users.is_onboarded = true`;
    const paramsWithoutPagination: unknown[] = [userId, treatmentId];
    if (search) {
      queryWithoutPagination += ` AND (first_name ILIKE $3 OR last_name ILIKE $3 OR email ILIKE $3 OR user_name ILIKE $3)`;
      paramsWithoutPagination.push(`%${search}%`);
    }

    let queryWithPagination = `SELECT DISTINCT
    users.* AS buddies
    FROM
    user_friends
    LEFT JOIN
    users ON users.id = user_friends.friend_id AND user_friends.user_id= $1
  WHERE
    NOT EXISTS (
      SELECT 1
      FROM
        treatment_buddies
      WHERE
        treatment_buddies.user_id = user_friends.friend_id
        AND treatment_buddies.treatment_id = $2 AND treatment_buddies.is_deleted = false
    )
    AND users.is_onboarded = true`;
    const paramsWithPagination: unknown[] = [userId, treatmentId];

    if (search) {
      queryWithPagination += ` AND (first_name ILIKE $3 OR last_name ILIKE $3 OR email ILIKE $3 OR user_name ILIKE $3)
        ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(`%${search}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      paramsWithPagination.push(limit, offset);
    }

    const [[{ total }], buddies] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<Users>(queryWithPagination, paramsWithPagination),
    ]);
    return { buddies, total };
  }

  async updateCoachRole(
    doctorId: string,
    coachId: string,
    treatmentId: string,
    treatment_role: TreatmentRoles,
  ): Promise<DoctorTreatment> {
    const query = `UPDATE doctor_treatments SET role = $3, updated_by = $4 WHERE doctor_id = $1 AND treatment_id=$2 RETURNING *;`;
    const [updatedCoachRole] = await this.database.query<DoctorTreatment>(
      query,
      [coachId, treatmentId, treatment_role, doctorId],
    );
    return updatedCoachRole;
  }

  async getTreatmentComplaintsCount(
    treatmentComplaintsIds: string[],
  ): Promise<number> {
    const query = `SELECT COUNT(*) FROM treatment_complaints WHERE id = ANY($1::uuid[])`;
    const [{ count }] = await this.database.query<{ count: string }>(query, [
      treatmentComplaintsIds,
    ]);

    return Number(count);
  }

  async deleteTreatmentPatientComplaint(
    userId: string,
  ): Promise<TreatmentPatientComplaint[]> {
    const query = `DELETE FROM treatment_patient_complaints WHERE user_id=$1 RETURNING *;`;
    const treatmentPatientComplaint =
      await this.database.query<TreatmentPatientComplaint>(query, [userId]);
    return treatmentPatientComplaint;
  }

  async addTreatmentPatientComplaints(
    input: TreatmentPatientComplaintDTO[],
  ): Promise<TreatmentPatientComplaint[]> {
    const keys = Object.keys(input[0]);
    const columns = keys.join(',');
    const values = input
      .map(
        (treatmentPatientComplaint) =>
          `(${Object.values(treatmentPatientComplaint)
            .map((value) => `'${value}'`)
            .join(', ')})`,
      )
      .join(', ');
    const query = `INSERT INTO treatment_patient_complaints (${columns}) VALUES ${values} RETURNING *`;
    const treatmentPatientComplaints =
      await this.database.batchQuery<TreatmentPatientComplaint>(query);
    return treatmentPatientComplaints.map(
      (treatmentPatientComplain) => treatmentPatientComplain[0],
    );
  }

  async getTreatmentProfile(
    treatmentId: string,
    userId: string,
  ): Promise<TreatmentProfileDto> {
    const query = `SELECT
    users.first_name,
    users.last_name,
    users.full_name,
    users.user_name,
    users.date_of_birth,
    users.email,
    users.gender,
    users.avatar_image_name,
    ROW_TO_JSON(membership_stages.*) AS membership_stage,
    membership_levels.sequence_number AS membership_level,
    treatment_options.title,
    treatment_options.translations,
    COALESCE(
      (
        SELECT
          JSON_AGG(treatment_complaints.*)
        FROM
          treatment_complaints
          LEFT JOIN treatment_patient_complaints ON treatment_complaints.id = treatment_patient_complaints.treatment_complaint_id
        WHERE
          treatment_patient_complaints.user_id = $1
          AND treatment_patient_complaints.treatment_id = $2
      ),
      '[]'
    ) AS treatment_complaints,
    COALESCE(
      (
        SELECT
          COUNT(user_friends.friend_id)
        FROM
          user_friends
          JOIN users ON users.id = user_friends.friend_id
        WHERE
          user_friends.user_id = $1
          AND user_friends.friend_id NOT IN (
            SELECT
              blocked_users.blocked_user_id
            FROM
              blocked_users
            WHERE
              blocked_users.blocked_by_user_id = $1
          )
      ),
      0
    ) AS friends_count,
    COALESCE(
      (
        SELECT
          COUNT(DISTINCT user_donations.donor_user_id)
        FROM
          user_donations
          JOIN users ON users.id = user_donations.donor_user_id
        WHERE
          user_donations.receiver_user_id = $1
          AND user_donations.donor_user_id NOT IN (
            SELECT
              blocked_users.blocked_user_id
            FROM
              blocked_users
            WHERE
              blocked_users.blocked_by_user_id = $1
          )
      ),
      0
    ) AS helped_count
  FROM
    users
    LEFT JOIN membership_stages ON users.current_membership_stage_id = membership_stages.id
    LEFT JOIN membership_levels ON users.current_membership_level_id = membership_levels.id
    LEFT JOIN treatments ON treatments.id = $2
    LEFT JOIN treatment_options ON treatments.option_id = treatment_options.id
  WHERE
    users.id = $1
  GROUP BY
    users.id,
    membership_levels.id,
    treatment_options.id,
    membership_stages.id
    `;
    const [treatmentProfile] = await this.database.query<TreatmentProfileDto>(
      query,
      [userId, treatmentId],
    );
    return treatmentProfile;
  }

  async getTreatmentComplaintList(): Promise<TreatmentComplaint[]> {
    const query = `
      SELECT * FROM treatment_complaints
      WHERE is_deleted = $1;
    `;

    const data = await this.database.query<TreatmentComplaint>(query, [false]);
    return data;
  }

  async getUserTreatmentTeam(
    userId: string,
  ): Promise<GetUserTreatmentTeamResponse> {
    const query = `SELECT
    ROW_TO_JSON(treatments.*) AS treatment,
    COALESCE(
        (
            SELECT JSON_AGG(doctor_coach.*)
            FROM (
                SELECT
                    doctor_users.id,
                    doctor_users.first_name,
                    doctor_users.last_name,
                    doctor_users.user_name,
                    doctor_users.image_url,
                    doctor_users.image_id,
                    doctor_users.file_path,
                    doctor_treatments.treatment_id,
                    doctor_treatments.id AS doctor_treatment_id,
                    doctor_treatments.role AS doctor_treatment_role,
                    doctor_treatments.is_owner
                FROM
                    doctor_treatments
                    LEFT JOIN users AS doctor_users ON doctor_treatments.doctor_id = doctor_users.id
                WHERE
                    doctor_treatments.is_deleted = false
                    AND is_archived = false
                    AND treatments.id = doctor_treatments.treatment_id
            ) AS doctor_coach
        ),
        '[]'
    ) AS coaches,
    COALESCE(
        (
            SELECT JSON_AGG(buddy.*)
            FROM (
                SELECT
                    users.id,
                    users.full_name,
                    users.first_name,
                    users.last_name,
                    users.user_name,
                    users.avatar_image_name,
                    treatment_buddies.id AS treatment_buddy_id,
                    treatment_buddies.treatment_id
                FROM
                    treatment_buddies
                    LEFT JOIN users ON treatment_buddies.user_id = users.id
                WHERE
                    treatment_buddies.is_deleted = false
                    AND treatments.id = treatment_buddies.treatment_id
            ) AS buddy
        ),
        '[]'
    ) AS buddies
  FROM
      treatments
  WHERE
      treatments.user_id = $1
      AND treatments.is_deleted = $2`;
    const [treatmentTeam] =
      await this.database.query<GetUserTreatmentTeamResponse>(query, [
        userId,
        false,
      ]);
    return treatmentTeam;
  }

  async getUserTreatmentProfile(
    userId: string,
  ): Promise<UserTreatmentProfileDto> {
    const query = `SELECT
    users.id,
    users.first_name,
    users.last_name,
    users.date_of_birth,
    users.email,
    users.user_name,
    users.gender,
    treatments.id AS treatment_id,
    treatment_options.title,
    treatment_options.translations
  FROM
    users
    LEFT JOIN treatments ON users.id = treatments.user_id
    LEFT JOIN treatment_options ON treatments.option_id = treatment_options.id
  WHERE
    users.id = $1 
    AND treatments.is_deleted = $2;`;
    const [userTreatmentProfile] =
      await this.database.query<UserTreatmentProfileDto>(query, [
        userId,
        false,
      ]);
    return userTreatmentProfile;
  }

  async getTreatmentDoctorsCount(
    treatmentId: string,
  ): Promise<{ total: number }> {
    const query = `SELECT CAST(COALESCE(COUNT(*), '0') AS INTEGER) AS total
    FROM doctor_treatments
    WHERE treatment_id = $1 AND is_deleted = $2`;
    const [doctorTreatmentCount] = await this.database.query<{ total: number }>(
      query,
      [treatmentId, false],
    );
    return doctorTreatmentCount;
  }

  async deleteTreatment(treatmentId: string): Promise<Treatment> {
    const query = `UPDATE treatments SET is_deleted = $1  WHERE id = $2 RETURNING *;`;
    const [treatment] = await this.database.query<Treatment>(query, [
      true,
      treatmentId,
    ]);
    return treatment;
  }

  async getAppointmentDoctorList(
    treatmentId: string,
  ): Promise<DoctorListData[]> {
    const query = `
    SELECT users.* 
    FROM users
    JOIN doctor_treatments ON users.id = doctor_treatments.doctor_id
    WHERE doctor_treatments.treatment_id = $1 
        AND doctor_treatments.is_deleted = $2`;
    const data = await this.database.query<DoctorListData>(query, [
      treatmentId,
      false,
    ]);
    return data;
  }

  async getDoctorPatientsList(
    doctorId: string,
    search?: string,
  ): Promise<PatientsListData[]> {
    const searchQuery = `AND (first_name ILIKE $2 OR last_name ILIKE $2 OR user_name ILIKE $2 OR full_name ILIKE $2)`;

    const query = ` SELECT
    users.id,
    users.first_name,
    users.last_name,
    users.user_name,
    users.full_name,
    users.avatar,
    users.avatar_image_name
  FROM
    users
    LEFT JOIN treatments ON treatments.user_id = users.id
    LEFT JOIN doctor_treatments ON doctor_treatments.treatment_id = treatments.id
  WHERE
    doctor_treatments.doctor_id = $1
    AND doctor_treatments.is_deleted = false
    AND doctor_treatments.is_archived = false
    ${search ? `${searchQuery}` : ``}
  `;

    const params: unknown[] = [doctorId];
    if (search) {
      params.push(`%${search}%`);
    }
    const patientsList = await this.database.query<PatientsListData>(
      query,
      params,
    );

    return patientsList;
  }

  async getTreatmentAndUser(
    treatmentId: string,
    is_treatment_deleted: boolean,
  ): Promise<TreatmentAndUserDTO> {
    const query = `SELECT treatments.*, ROW_TO_JSON(users.*) as users
    FROM treatments 
    LEFT JOIN users ON users.id=treatments.user_id
    WHERE treatments.id=$1 AND treatments.is_deleted = $2 ;`;
    const [treatment] = await this.database.query<TreatmentAndUserDTO>(query, [
      treatmentId,
      is_treatment_deleted,
    ]);
    return treatment;
  }

  async getTreatmentDoctors(
    treatmentId: string,
  ): Promise<TreatmentDoctorData[]> {
    const query = `SELECT
    doctor_treatments.*,
    ROW_TO_JSON(users) as doctor
  FROM
    doctor_treatments
    LEFT JOIN LATERAL (
      SELECT
        users.id,
        users.avatar_image_name,
        users.user_name,
        users.first_name,
        users.last_name,
        users.role,
        users.file_path
      FROM
        users
      WHERE
        doctor_treatments.doctor_id = users.id
    ) AS users ON true 
  WHERE
    doctor_treatments.treatment_id = $1 ;`;
    const treatmentDoctors = await this.database.query<TreatmentDoctorData>(
      query,
      [treatmentId],
    );
    return treatmentDoctors;
  }

  async getUserGoalsWithGoalLevel(
    userId: string,
    lang: string,
  ): Promise<UserGoalsWithGoalLevel[]> {
    const query = `SELECT
    goals.*
  FROM
    user_goals
    LEFT JOIN LATERAL (
      SELECT
        goals.id,
        CASE
          WHEN goals.translations ->> $2 IS NOT NULL THEN (goals.translations ->> $2 ) ::json ->> 'title'
          ELSE goals.title
        END AS title,
        ROW_TO_JSON(goal_levels.*) as user_goal_level
      FROM
        goals
        LEFT JOIN LATERAL (
          SELECT
            goal_levels.id,
            CASE
              WHEN goal_levels.translations ->> $2 IS NOT NULL THEN (goal_levels.translations ->> $2 ) ::json ->> 'title'
              ELSE goal_levels.title
            END AS title
          FROM
            goal_levels
            LEFT JOIN user_goal_levels ON user_goal_levels.goal_level_id = goal_levels.id
            AND user_goal_levels.user_id = $1
          WHERE
            goal_levels.goal_id = goals.id
          ORDER BY
            goal_levels.sequence_number DESC
          LIMIT
            1
        ) AS goal_levels ON true
      WHERE
        goals.id = user_goals.goal
    ) AS goals ON true
  WHERE
    user_goals.user_id = $1;`;
    const userGoalsWithGoalLevel =
      await this.database.query<UserGoalsWithGoalLevel>(query, [userId, lang]);
    return userGoalsWithGoalLevel;
  }

  async getUserTreatmentAppointments(
    treatmentId: string,
  ): Promise<UserTreatmentAppointment[]> {
    const query = `
    SELECT
    schedules.user_appointment_id,
    users.first_name AS doctor_first_name,
    users.last_name AS doctor_last_name,
    doctor_treatments.role As doctor_role,
    schedules.start_date,
    schedules.end_date,
    user_appointments.appointment_type,
    user_appointments.location
  FROM
    schedules
    LEFT JOIN user_appointments ON schedules.user_appointment_id = user_appointments.id
    LEFT JOIN doctor_treatments ON user_appointments.doctor_id = doctor_treatments.doctor_id
    LEFT JOIN users ON doctor_treatments.doctor_id = users.id
  WHERE
    schedules.treatment_id = $1
    AND schedules.schedule_for = $2
    AND doctor_treatments.treatment_id = $1
  ORDER BY
    schedules.start_date DESC`;
    const data = await this.database.query<UserTreatmentAppointment>(query, [
      treatmentId,
      ScheduleFor.APPOINTMENT,
    ]);
    return data;
  }

  async getUserTreatmentTimelineNotes(
    treatmentId: string,
  ): Promise<UserTreatmentTimelineNote[]> {
    const query = `
    SELECT
  treatment_timeline_attachments.title,
  treatment_timeline_attachments.description,
  treatment_timeline_attachments.is_private_note,
  users.role,
  treatment_timeline_attachments.created_at
  
FROM
  treatment_timeline
  LEFT JOIN treatment_timeline_attachments ON treatment_timeline.attachment_id = treatment_timeline_attachments.id
  LEFT JOIN users ON treatment_timeline_attachments.created_by = users.id
WHERE
  treatment_timeline.treatment_id = $1
  AND treatment_timeline.stage_type = $2
  ORDER BY treatment_timeline_attachments.created_at DESC`;
    const data = await this.database.query<UserTreatmentTimelineNote>(query, [
      treatmentId,
      StageType.NOTE,
    ]);
    return data;
  }

  async getTermsAndConditionsAndPrivacyPolicy(
    lang: string,
  ): Promise<TermsAndConditionsAndPrivacyPolicy> {
    const query = `SELECT
    CASE
      WHEN terms_and_conditions.translations ->> $1 IS NOT NULL THEN (terms_and_conditions.translations ->> $1 ) ::json ->> 'terms_and_condition_info'
      ELSE terms_and_conditions.terms_and_condition_info
    END AS terms_and_condition_info,
    CASE
      WHEN privacy_policy.translations ->> $1 IS NOT NULL THEN (privacy_policy.translations ->> $1 ) ::json ->> 'privacy_policy_info'
      ELSE privacy_policy.privacy_policy_info
    END AS privacy_policy_info
  FROM
    privacy_policy
    JOIN terms_and_conditions ON true`;
    const [privacyPolicy] =
      await this.database.query<TermsAndConditionsAndPrivacyPolicy>(query, [
        lang,
      ]);
    return privacyPolicy;
  }

  /**
   * @description This function is used to delete the doctor treatments associated with the specific treatmentId
   */
  async deleteDoctorsTreatment(
    doctorId: string,
    treatmentId: string,
  ): Promise<DoctorTreatment[]> {
    const query = `UPDATE doctor_treatments SET is_deleted=$1, updated_by = $2  WHERE treatment_id=$3 RETURNING *;`;
    const doctorTreatment = await this.database.query<DoctorTreatment>(query, [
      true,
      doctorId,
      treatmentId,
    ]);
    return doctorTreatment;
  }

  async updateTreatmentChatDisableAndChatUsersArchiveStatus(
    treatmentId: string,
    status: boolean,
  ): Promise<Chat> {
    const query = `
    WITH updated_chats AS (
      UPDATE chats
      SET is_disabled = $1
      WHERE treatment_id = $2
      RETURNING *
  ), updated_chat_users AS (
      UPDATE chat_users
      SET is_archived = $1
      WHERE treatment_id = $2
      RETURNING *
  )
  SELECT * FROM updated_chats;
  `;
    const [updatedChat] = await this.database.query<Chat>(query, [
      status,
      treatmentId,
    ]);
    return updatedChat;
  }

  async updateUserProfile(
    userId: string,
    updates: UpdateTreatmentUserProfileDto,
  ): Promise<Users> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE users SET ${setFields} WHERE id = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, userId];

    const [updateUserProfile] = await this.database.query<Users>(
      query,
      updateValues,
    );
    return updateUserProfile;
  }

  async getPatientInvitation(
    invitationId: string,
    email: string,
  ): Promise<PatientInvitation | null> {
    const query = `SELECT * FROM patient_invitations WHERE id = $1 AND email = $2 AND status = $3 ;`;
    const [patientInvitation] = await this.database.query<PatientInvitation>(
      query,
      [invitationId, email, PaitentInvitationStatus.ACCEPTED],
    );
    return patientInvitation;
  }
}
