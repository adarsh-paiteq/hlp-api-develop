import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { Doctor } from './entities/doctors.entity';
import { DoctorUpdateDto } from './dto/register-password.dto';
import { UserSecurityAndPrivacySettings, Users } from '../users/users.model';
import {
  DoctorPatientsListInput,
  PatientsList,
  patientsListSortField,
} from './dto/doctor-patients-list.dto';
import { UserNotificationSettings, UserRoles } from '../users/users.dto';
import { DoctorList, GetDoctorListArgs } from './dto/get-doctor-list.dto';
import { InsertDoctor, InsertDoctorStatusInfo } from './dto/add-doctor.dto';
import { UpdateDoctorSecurityAndPrivacySettingDto } from './dto/doctor-sectrity-and-privacy-settings.dto';
import { UserSecurityAndPrivacySetting } from '@users/entities/user-security-and-privacy-settings.entity';
import { UpdateDoctorNotificationSettingsInput } from './dto/doctor-notification-settings.dto';
import { UsersEmailChangeRequest } from './entities/users-email-change-requests.entity';
import { UserEmailChangeRequestInput } from './dto/send-change-doctor-email-request.dto';
import { DoctorSpecialities } from './entities/doctor-specialities.entity';
import {
  DoctorProfileVideoDTO,
  DoctorSpecialitiesDTO,
} from './dto/update-doctor-profile.dto';
import { DoctorProfileVideo } from './entities/doctor-profile-videos.entity';
import { UserStatusLogs } from '../users/entities/user-status-logs.entity';
import { InsertDoctorStatusLogs } from './dto/create-doctor-status-logs.dto';
import {
  UserStatus,
  UserStatusInfo,
} from '../users/entities/user-status-info.entity';
import { Speciality } from './entities/specialities.entity';
import { DoctorsData } from './dto/get-organization-doctors.dto';
import { TreatmentDoctorsData } from './dto/get-treatment-doctors.dto';
import { DoctorProfileDto } from './dto/get-doctor-profile.dto';
import { PatientsData } from './dto/get-doctor-patients.dto';
import { InsertSupportQuestion } from './dto/create-support-question.dto';
import { SupportQuestions } from './entities/support-questions.entity';

@Injectable()
export class DoctorsRepo {
  constructor(private readonly database: Database) {}
  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const [doctor] = await this.database.query<Doctor>(query, [doctorId]);
    return doctor;
  }

  async updateDoctorById(
    doctorId: string,
    updates: DoctorUpdateDto,
  ): Promise<Doctor> {
    const parameters = [...Object.values(updates), doctorId];
    const query =
      'UPDATE users SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;
    const [updatedDoctor] = await this.database.query<Doctor>(
      query,
      parameters,
    );
    return updatedDoctor;
  }

  async getDoctorByEmail(email: string, role?: string): Promise<Doctor[]> {
    let query = 'SELECT * FROM users where email=$1';
    const params = [email];
    if (role) {
      query += ' AND role=$2';
      params.push(role);
    }
    const doctor = await this.database.query<Doctor>(query, params);
    return doctor;
  }

  async searchUsers(
    page: number,
    limit: number,
    organisationId: string,
    text?: string,
  ): Promise<{ users: Users[]; total: number }> {
    const offset = (page - 1) * limit;
    let queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total
      FROM users WHERE is_onboarded = true AND role = $1 AND organization_id = $2`;
    const paramsWithoutPagination: unknown[] = [UserRoles.USER, organisationId];

    if (text) {
      queryWithoutPagination += ` AND (first_name ILIKE $3 OR last_name ILIKE $3 OR user_name ILIKE $3 OR email ILIKE $3 OR to_char(date_of_birth, 'YYYY-MM-DD') ILIKE $3)`;
      paramsWithoutPagination.push(`%${text}%`);
    }

    let queryWithPagination = `SELECT * FROM users WHERE is_onboarded = true AND role = $1 AND organization_id = $2`;
    const paramsWithPagination: unknown[] = [UserRoles.USER, organisationId];

    if (text) {
      queryWithPagination += ` AND (first_name ILIKE $3 OR last_name ILIKE $3 OR user_name ILIKE $3 OR email ILIKE $3 OR to_char(date_of_birth, 'YYYY-MM-DD') ILIKE $3)
        ORDER BY created_at DESC LIMIT $4 OFFSET $5`;
      paramsWithPagination.push(`%${text}%`, limit, offset);
    } else {
      queryWithPagination += ` ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      paramsWithPagination.push(limit, offset);
    }

    const [[{ total }], users] = await Promise.all([
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
      this.database.query<Users>(queryWithPagination, paramsWithPagination),
    ]);

    return { users, total };
  }

  async getDoctorPatientsList(
    input: DoctorPatientsListInput,
    doctorId: string,
  ): Promise<{
    patients: PatientsList[];
    total: number;
  }> {
    const { limit, page, search, filters, sort_field, sort_order } = input;
    const offset = (page - 1) * limit;
    const isArchived = filters?.is_archived || false;

    const queryParams: (string | boolean | number)[] = [
      doctorId,
      false,
      isArchived,
    ];

    const selectFieldsQuery = `
    SELECT
        users.avatar_image_name,
        users.id AS user_id,
        users.first_name,
        users.last_name,
        users.full_name,
        doctor_treatments.id AS treatment_id,
        treatments.id,
        doctor_treatments.role,
        treatment_options.title,
        treatment_options.translations,
        to_char(users.created_at, 'DD/MM/YYYY') AS last_registration,
        doctor_treatments.is_owner,
        user_status_info.status,
        to_char(chat_messages.updated_at, 'DD/MM/YYYY') AS last_message
    FROM treatments`;

    const selectTotalQuery = `
    SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM treatments`;

    const joinsQuery = `
    LEFT JOIN treatment_options ON treatments.option_id = treatment_options.id
    LEFT JOIN doctor_treatments ON treatments.id = doctor_treatments.treatment_id
    LEFT JOIN users ON treatments.user_id = users.id
    LEFT JOIN user_status_info ON user_status_info.user_id = users.id
    LEFT JOIN LATERAL (
      SELECT chat_messages.updated_at
      FROM chat_messages
       LEFT JOIN users ON treatments.user_id = users.id
        LEFT JOIN chat_users ON chat_users.user_id = users.id
         LEFT JOIN chats ON chats.id = chat_users.chat_id
      WHERE chat_messages.chat_id = chats.id
      ORDER BY updated_at DESC
      LIMIT 1
  ) AS chat_messages ON true
    `;

    let filterQuery = `
    WHERE doctor_treatments.doctor_id = $1 
    AND doctor_treatments.is_deleted = $2 
    AND doctor_treatments.is_archived = $3 `;

    if (search) {
      queryParams.push(`%${search}%`);
      filterQuery += ` 
          AND (
              first_name ILIKE $${queryParams.length}
              OR last_name ILIKE $${queryParams.length}
              OR user_name ILIKE $${queryParams.length}
              OR email ILIKE $${queryParams.length}
              OR to_char(date_of_birth, 'YYYY-MM-DD') ILIKE $${queryParams.length}
          ) `;
    }

    if (filters?.roles?.length) {
      const placeHolders = filters.roles
        .map((role) => {
          queryParams.push(role);
          return `$${queryParams.length}`;
        })
        .join(',');

      filterQuery += ` AND doctor_treatments.role IN (${placeHolders}) `;
    }

    if (filters?.treatments?.length) {
      const placeHolders = filters.treatments
        .map((id) => {
          queryParams.push(id);
          return `$${queryParams.length}`;
        })
        .join(',');

      filterQuery += ` AND treatments.option_id IN (${placeHolders}) `;
    }

    const sortField = patientsListSortField.get(sort_field) as string;
    const sortQuery = `ORDER BY ${sortField} ${sort_order} `;

    const paramsWithoutPagination = [...queryParams];

    const paginationQuery = ` LIMIT $${queryParams.length + 1} OFFSET $${
      queryParams.length + 2
    } `;
    queryParams.push(limit, offset);

    const commonQuery = ` ${joinsQuery} ${filterQuery}`;
    const queryWithPagination = `${selectFieldsQuery} ${commonQuery} ${sortQuery} ${paginationQuery}`;
    const queryWithoutPagination = `${selectTotalQuery} ${commonQuery}`;
    const [patients, [{ total }]] = await Promise.all([
      this.database.query<PatientsList>(queryWithPagination, queryParams),
      this.database.query<{ total: number }>(
        queryWithoutPagination,
        paramsWithoutPagination,
      ),
    ]);

    return {
      patients,
      total,
    };
  }

  async getDoctorList(
    role: UserRoles,
    args: GetDoctorListArgs,
  ): Promise<{
    doctors: DoctorList[];
    total: number;
  }> {
    const { page, limit, search } = args;
    const offset = (page - 1) * limit;
    const searchQuery = `AND (users.first_name ILIKE $2 OR users.last_name ILIKE $2 OR users.email ILIKE $2)`;
    const commonQuery = `FROM users LEFT JOIN organisations ON users.organization_id = organisations.id`;
    const queryWithPagination = `SELECT users.*,organisations.name as organisation_name ${commonQuery} WHERE role=$1 ${
      search
        ? `${searchQuery}ORDER BY users.created_at DESC LIMIT $3 OFFSET $4`
        : `ORDER BY users.created_at DESC LIMIT $2 OFFSET $3`
    }`;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(users.*),'0') AS INTEGER) AS total ${commonQuery}  WHERE role=$1 ${
      search ? `${searchQuery}` : ` `
    }`;
    const params: unknown[] = [role];
    if (search) {
      params.push(`%${search}%`);
    }
    const [doctors, [{ total }]] = await Promise.all([
      this.database.query<DoctorList>(queryWithPagination, [
        ...params,
        limit,
        offset,
      ]),
      this.database.query<{ total: number }>(queryWithoutPagination, params),
    ]);

    return { doctors, total };
  }
  async addDoctor(input: InsertDoctor): Promise<Doctor> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO users (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [doctor] = await this.database.query<Doctor>(query, values);
    return doctor;
  }
  async getOrganizationDoctors(
    page: number,
    limit: number,
    doctorId: string,
    organizationId: string,
    search?: string,
  ): Promise<{
    doctors: DoctorsData[];
    total: number;
  }> {
    const offset = (page - 1) * limit;
    const commonQuery = `FROM users  LEFT JOIN user_status_info ON users.id = user_status_info.user_id WHERE organization_id=$1 AND is_deleted=$2 AND role=$3 AND users.id <>$4`;
    const searchQuery = `AND (first_name ILIKE $5 OR last_name ILIKE $5 OR user_name ILIKE $5)`;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT( users.*),'0') AS INTEGER) AS total ${commonQuery} ${
      search ? `${searchQuery}` : ` `
    }`;
    const params: unknown[] = [
      organizationId,
      false,
      UserRoles.DOCTOR,
      doctorId,
    ];
    const query = `SELECT 
    users.id,
    users.first_name,
    users.last_name,
    users.image_url,
    users.image_id,
    users.file_path,
    users.user_name,
     user_status_info.status as status ${commonQuery}${
      search
        ? `${searchQuery} ORDER BY users.id LIMIT $6 OFFSET $7`
        : `ORDER BY users.id LIMIT $5 OFFSET $6`
    }`;
    if (search) {
      params.push(`%${search}%`);
    }
    const [[{ total }], doctors] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, params),
      this.database.query<DoctorsData>(query, [...params, limit, offset]),
    ]);

    return { doctors, total };
  }
  async getDoctors(organizationId: string): Promise<Doctor[]> {
    const query = `SELECT * FROM users 
    WHERE users.organization_id = $1 
    AND users.role=$2
    AND users.is_onboarded = true`;
    const doctor = await this.database.query<Doctor>(query, [
      organizationId,
      UserRoles.DOCTOR,
    ]);
    return doctor;
  }

  async deleteDoctor(doctorId: string): Promise<Doctor> {
    const query =
      'UPDATE users SET is_deleted= $1 ,refresh_token= $4 WHERE id = $2 AND role= $3 RETURNING *;';
    const [deletedDoctor] = await this.database.query<Doctor>(query, [
      true,
      doctorId,
      UserRoles.DOCTOR,
      null,
    ]);
    return deletedDoctor;
  }

  async getUserPrivacyAndSecuritySetting(
    doctorId: string,
  ): Promise<UserSecurityAndPrivacySetting> {
    const userSecurityAndPrivacyQuery = `SELECT * FROM user_security_and_privacy_settings WHERE user_id=$1`;
    const [userSecurityAndPrivacySetting] =
      await this.database.query<UserSecurityAndPrivacySetting>(
        userSecurityAndPrivacyQuery,
        [doctorId],
      );
    return userSecurityAndPrivacySetting;
  }
  async saveDoctorNotificationSettings(
    doctorId: string,
  ): Promise<UserNotificationSettings> {
    const query = `INSERT INTO user_notification_settings(user_id,
      play_reminder_sound,
      reminder_sound,
      allow_reminder_email_notification,
      allow_reminder_push_notification,
      allow_community_email_notification,
      allow_community_push_notification,
      allow_post_reaction_email_notification,
      allow_post_reaction_push_notification,
      allow_informational_email_notification)
      values($1,$3,'',$2,$3,$2,$2,$2,$2,$2) RETURNING *`;
    const [userNotification] =
      await this.database.query<UserNotificationSettings>(query, [
        doctorId,
        'false',
        'true',
      ]);
    return userNotification;
  }
  async addUserEmailChangeRequest(
    input: UserEmailChangeRequestInput,
  ): Promise<UsersEmailChangeRequest> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO users_email_change_requests (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [users] = await this.database.query<UsersEmailChangeRequest>(
      query,
      values,
    );
    return users;
  }

  async getDoctorEmailChangeRequest(
    doctorId: string,
  ): Promise<UsersEmailChangeRequest> {
    const query = `SELECT * FROM users_email_change_requests
    WHERE user_id =$1 AND is_verified=$2
    ORDER BY created_at DESC;`;
    const [doctorEmailChangeRequest] =
      await this.database.query<UsersEmailChangeRequest>(query, [
        doctorId,
        false,
      ]);
    return doctorEmailChangeRequest;
  }

  async updateDoctorEmailChangeRequest(
    doctorEmailChangeRequestId: string,
  ): Promise<UsersEmailChangeRequest> {
    const query =
      'UPDATE users_email_change_requests SET is_verified=$1 WHERE id = $2';
    const [doctorEmailChangeRequest] =
      await this.database.query<UsersEmailChangeRequest>(query, [
        true,
        doctorEmailChangeRequestId,
      ]);
    return doctorEmailChangeRequest;
  }

  async getDoctorNotificationSetting(
    doctorId: string,
  ): Promise<UserNotificationSettings> {
    const query = `SELECT * FROM user_notification_settings WHERE user_id = $1`;
    const [doctorNotification] =
      await this.database.query<UserNotificationSettings>(query, [doctorId]);
    return doctorNotification;
  }

  async saveDoctorSecurityAndPrivacySettings(
    doctorId: string,
  ): Promise<UserSecurityAndPrivacySettings> {
    const query = `INSERT INTO user_security_and_privacy_settings(
      user_id,
      app_access_pin,
      app_lock_enabled,
      my_posts_can_be_seen_by_all_users,
      my_posts_can_be_seen_by_my_friends)
      values($1,'',$2,$2,$2) RETURNING *`;
    const [userPrivacySettings] =
      await this.database.query<UserSecurityAndPrivacySettings>(query, [
        doctorId,
        'false',
      ]);
    return userPrivacySettings;
  }

  async updateDoctorSecurityAndPrivacySetting(
    doctorId: string,
    input: UpdateDoctorSecurityAndPrivacySettingDto,
  ): Promise<UserSecurityAndPrivacySetting> {
    const keys = Object.keys(input);
    const values = Object.values(input);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE user_security_and_privacy_settings SET ${setFields} WHERE user_id = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, doctorId];

    const [privacySettings] =
      await this.database.query<UserSecurityAndPrivacySetting>(
        query,
        updateValues,
      );

    return privacySettings;
  }

  async getTreatmentDoctors(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ doctors: TreatmentDoctorsData[]; total: number }> {
    const offset = (page - 1) * limit;
    const commonQuery = `FROM
    users
    LEFT JOIN doctor_treatments ON doctor_treatments.doctor_id = users.id
    LEFT JOIN treatments ON treatments.id = doctor_treatments.treatment_id  WHERE treatments.user_id = $1 AND treatments.is_deleted = $2 AND doctor_treatments.is_archived= $2 AND doctor_treatments.is_deleted=$3`;
    const searchQuery = `AND (first_name ILIKE $4 OR last_name ILIKE $4 OR user_name ILIKE $4 OR email ILIKE $4 OR full_name ILIKE $4)`;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT( DISTINCT users.*),'0') AS INTEGER) AS total ${commonQuery} ${
      search ? `${searchQuery}` : ` `
    }`;
    const params: unknown[] = [userId, false, false];
    const query = `SELECT
    DISTINCT users.id,users.first_name,users.last_name,users.user_name,users.image_id,users.image_url,users.file_path ,users.avatar_type ,  users.avatar_image_name ,treatments.id AS treatment_id ${commonQuery}${
      search
        ? `${searchQuery} ORDER BY users.id LIMIT $5 OFFSET $6`
        : `ORDER BY users.id LIMIT $4 OFFSET $5`
    }`;
    if (search) {
      params.push(`%${search}%`);
    }
    const [[{ total }], doctors] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, params),
      this.database.query<TreatmentDoctorsData>(query, [
        ...params,
        limit,
        offset,
      ]),
    ]);
    return { doctors, total };
  }

  async getDoctorPatients(
    doctorId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ patients: PatientsData[]; total: number }> {
    const offset = (page - 1) * limit;
    const commonQuery = ` FROM
  users
  LEFT JOIN treatments ON treatments.user_id= users.id AND users.role=$1
  LEFT JOIN doctor_treatments ON doctor_treatments.treatment_id = treatments.id
WHERE
  doctor_treatments.doctor_id = $2 AND doctor_treatments.is_deleted=$3 AND doctor_treatments.is_archived=$3`;
    const searchQuery = `AND (first_name ILIKE $4 OR last_name ILIKE $4 OR user_name ILIKE $4 OR full_name ILIKE $4)`;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT( DISTINCT users.*),'0') AS INTEGER) AS total ${commonQuery} ${
      search ? `${searchQuery}` : ` `
    }`;
    const params: unknown[] = [UserRoles.USER, doctorId, false];
    const query = `SELECT DISTINCT
  users.id,
  users.first_name,
  users.last_name,
  users.user_name,
  users.full_name,
  users.avatar,
  users.avatar_image_name, 
  treatments.id AS treatment_id
  ${commonQuery} ${
      search
        ? `${searchQuery} ORDER BY users.id LIMIT $5 OFFSET $6`
        : `ORDER BY users.id LIMIT $4 OFFSET $5`
    }`;
    if (search) {
      params.push(`%${search}%`);
    }
    const [[{ total }], patients] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, params),
      this.database.query<PatientsData>(query, [...params, limit, offset]),
    ]);
    return { patients, total };
  }

  async updateDoctorNotificationSetting(
    doctorId: string,
    input: UpdateDoctorNotificationSettingsInput,
  ): Promise<UserNotificationSettings> {
    const keys = Object.keys(input);
    const values = Object.values(input);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE user_notification_settings SET ${setFields} WHERE user_id = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, doctorId];

    const [notificationSettings] =
      await this.database.query<UserNotificationSettings>(query, updateValues);

    return notificationSettings;
  }

  async saveDoctorStatusInfo(
    input: InsertDoctorStatusInfo,
  ): Promise<UserStatusInfo> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_status_info (${columns}) VALUES (${placeholders}) RETURNING *`;
    const [doctorStatusInfo] = await this.database.query<UserStatusInfo>(
      query,
      values,
    );
    return doctorStatusInfo;
  }

  async getNotificationSettings(
    doctorId: string,
  ): Promise<UserNotificationSettings> {
    const query = `SELECT * FROM user_notification_settings WHERE user_id=$1 ;`;
    const [notificationSettings] =
      await this.database.query<UserNotificationSettings>(query, [doctorId]);
    return notificationSettings;
  }
  async getSpecialitiesCount(specialitiesIds: string[]): Promise<number> {
    const query = `SELECT COUNT(*) FROM specialities WHERE id = ANY($1::uuid[])`;
    const [{ count }] = await this.database.query<{ count: string }>(query, [
      specialitiesIds,
    ]);

    return Number(count);
  }

  async deleteDoctorSpecialities(
    doctorId: string,
  ): Promise<DoctorSpecialities[]> {
    const query = `DELETE FROM doctor_specialities WHERE doctor_id=$1 RETURNING *;`;
    const doctorSpeciality = await this.database.query<DoctorSpecialities>(
      query,
      [doctorId],
    );
    return doctorSpeciality;
  }

  async deleteDoctorProfileVideos(
    doctorId: string,
  ): Promise<DoctorProfileVideo[]> {
    const query = `DELETE FROM doctor_profile_videos WHERE doctor_id=$1 RETURNING *;`;
    return await this.database.query<DoctorProfileVideo>(query, [doctorId]);
  }

  async addDoctorSpecialities(
    input: DoctorSpecialitiesDTO[],
  ): Promise<DoctorSpecialities[]> {
    const keys = Object.keys(input[0]);
    const columns = keys.join(',');
    const values = input
      .map(
        (speciality) =>
          `(${Object.values(speciality)
            .map((value) => `'${value}'`)
            .join(', ')})`,
      )
      .join(', ');
    const query = `INSERT INTO doctor_specialities (${columns}) VALUES ${values} RETURNING *`;
    const doctorSpecialities =
      await this.database.batchQuery<DoctorSpecialities>(query);
    return doctorSpecialities.map((doctorSpeciality) => doctorSpeciality[0]);
  }

  async addDoctorProfileVideos(
    input: DoctorProfileVideoDTO[],
  ): Promise<DoctorProfileVideo[]> {
    const keys = Object.keys(input[0]);
    const columns = keys.join(',');
    const values = input
      .map(
        (profileVideo) =>
          `(${Object.values(profileVideo)
            .map((value) => `'${value}'`)
            .join(', ')})`,
      )
      .join(', ');
    const query = `INSERT INTO doctor_profile_videos (${columns}) VALUES ${values} RETURNING *`;
    const doctorProfileVideos =
      await this.database.batchQuery<DoctorProfileVideo>(query);
    return doctorProfileVideos.map(
      (doctorProfileVideo) => doctorProfileVideo[0],
    );
  }

  async getDoctorStatusInfo(doctorId: string): Promise<UserStatusInfo | null> {
    const query = 'SELECT * FROM user_status_info WHERE user_id = $1';
    const [doctorStatusInfo] = await this.database.query<UserStatusInfo>(
      query,
      [doctorId],
    );
    return doctorStatusInfo;
  }

  async updateDoctorStatus(
    doctorId: string,
    status: UserStatus,
  ): Promise<UserStatusInfo> {
    const query = `
      UPDATE user_status_info
      SET status = $1
      WHERE user_id = $2
      RETURNING *;
    `;
    const updateValues = [status, doctorId];
    const [data] = await this.database.query<UserStatusInfo>(
      query,
      updateValues,
    );
    return data;
  }

  async createUserStatusLog(
    doctorStatusLogs: InsertDoctorStatusLogs,
  ): Promise<UserStatusLogs> {
    const keys = Object.keys(doctorStatusLogs);
    const values = Object.values(doctorStatusLogs);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_status_logs (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [doctorStatusLog] = await this.database.query<UserStatusLogs>(
      query,
      values,
    );
    return doctorStatusLog;
  }

  async getDoctorProfile(doctorId: string): Promise<DoctorProfileDto> {
    const query = `SELECT
    users.first_name,
    users.last_name,
    users.gender,
    users.about_me,
    users.file_path,
    users.image_id,
    users.image_url,
    user_status_info.status,
    organisations.name ,
    organisations.translations,

COALESCE(
  (
    SELECT
      JSON_AGG(specialities.*)
    FROM
      specialities
      INNER JOIN doctor_specialities ON doctor_specialities.speciality_id = specialities.id
    WHERE
      doctor_specialities.doctor_id = users.id
  ),
  '[]'
) AS specialities,
COALESCE(
  (
    SELECT
      JSON_AGG(doctor_profile_videos.*)
    FROM
      (
        SELECT
          doctor_profile_videos.*
        FROM
          doctor_profile_videos
        WHERE doctor_profile_videos.doctor_id = users.id
        
        ORDER BY
          doctor_profile_videos.created_at DESC
      ) AS doctor_profile_videos
  ),
  '[]'
) AS profile_videos
FROM
    users
    LEFT JOIN user_status_info ON user_status_info.user_id = users.id
    LEFT JOIN organisations ON organisations.id = users.organization_id
    LEFT JOIN doctor_profile_videos ON doctor_profile_videos.doctor_id = users.id
    LEFT JOIN doctor_specialities ON doctor_specialities.doctor_id = users.id
    LEFT JOIN specialities ON specialities.id = doctor_specialities.speciality_id
WHERE
    users.id = $1
GROUP BY
    user_status_info.status,
    users.id,
    organisations.id;
    `;
    const [doctorProfile] = await this.database.query<DoctorProfileDto>(query, [
      doctorId,
    ]);
    return doctorProfile;
  }
  async getSpecialitiesList(): Promise<Speciality[]> {
    const query = `
      SELECT * FROM specialities
      WHERE is_deleted = $1;
    `;

    const data = await this.database.query<Speciality>(query, [false]);
    return data;
  }

  async createSupportQuestion(
    input: InsertSupportQuestion,
  ): Promise<SupportQuestions> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO support_questions (${columns}) VALUES (${placeholders}) RETURNING *`;
    const [supportQuestion] = await this.database.query<SupportQuestions>(
      query,
      values,
    );
    return supportQuestion;
  }
}
