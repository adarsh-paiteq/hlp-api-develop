import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { PSYQ_CLIENT } from './psyq.provider';
import {
  IsAliveResponse,
  PsyqAppointmentResponse,
  PsyqEmployee,
  PsyqPatientDocumentResponse,
  PsyqPatientDocumentsResponse,
} from './dto/psyq.dto';
import { ConfigService } from '@nestjs/config';
import { Database } from '@core/modules/database/database.service';
import { OauthUser } from '@oauth/entities/oauth-users.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import {
  SaveScheduleInput,
  SaveUserAppointmentInput,
} from '@schedules/dto/create-schedule.dto';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { Treatment } from '@treatments/entities/treatments.entity';

@Injectable()
export class PsyqRepo {
  constructor(
    @Inject(PSYQ_CLIENT) private readonly psyqClient: AxiosInstance,
    private readonly configService: ConfigService,
    private readonly database: Database,
  ) {}

  async isAlive(): Promise<IsAliveResponse> {
    const path = '/api/v1/isalive';
    const { data } = await this.psyqClient.get<IsAliveResponse>(path);
    return data;
  }

  async getPsyqPatientAppointments(
    patientOrganisationId: string,
    startDtae: string,
    endDate: string,
  ): Promise<PsyqAppointmentResponse> {
    const path = `/api/v1/patient/${patientOrganisationId}/appointment?from=${startDtae}&until=${endDate}`;
    const { data } = await this.psyqClient.get<PsyqAppointmentResponse>(path, {
      headers: {
        'PG-Audit-ID': uuidv4(),
      },
    });

    if (data.issue?.length) {
      const message = data.issue[0].details?.text;
      throw new BadRequestException(message);
    }

    return data;
  }

  async getPsyqDoctorAppointments(
    patientOrganisationId: string,
    startDtae: string,
    endDate: string,
  ): Promise<PsyqAppointmentResponse> {
    const path = `/api/v1/employee/${patientOrganisationId}/appointment?from=${startDtae}&until=${endDate}`;
    const { data } = await this.psyqClient.get<PsyqAppointmentResponse>(path);
    return data;
  }

  async getEmployeeByEmail(email: string): Promise<PsyqEmployee | null> {
    const path = `/api/v1/employee?identifier=https://koppelvlak.parnassiagroep.nl/upn{$UPN}`;
    const { data } = await this.psyqClient.get<PsyqEmployee>(path, {
      headers: {
        'PG-UPN': email,
      },
    });
    return data;
  }

  async getEmployeeById(employeeId: string): Promise<PsyqEmployee> {
    const path = `/api/v1/employee/${employeeId}`;
    const { data } = await this.psyqClient.get<PsyqEmployee>(path);
    return data;
  }

  async getPsyqPatientDocuments(
    patientOrganisationId: string,
    startDtae: string,
    endDate: string,
  ): Promise<PsyqPatientDocumentsResponse> {
    const path = `/api/v1/patient/${patientOrganisationId}/document?from=${startDtae}&until=${endDate}`;
    const { data } = await this.psyqClient.get<PsyqPatientDocumentsResponse>(
      path,
    );

    if (data.issue?.length) {
      const message = data.issue[0].details?.text;
      throw new BadRequestException(message);
    }

    return data;
  }

  async getPsyqPatientDocument(
    patientOrganisationId: string,
    documentId: string,
  ): Promise<PsyqPatientDocumentResponse> {
    const path = `/api/v1/patient/${patientOrganisationId}/document/${documentId}`;
    const { data } = await this.psyqClient.get<PsyqPatientDocumentResponse>(
      path,
    );

    if (data.issue?.length) {
      const message = data.issue[0].details?.text;
      throw new BadRequestException(message);
    }

    return data;
  }

  async getUserById<T>(userId: string): Promise<T> {
    const query = `SELECT * FROM users WHERE id = $1`;
    const [user] = await this.database.query<T>(query, [userId]);
    return user;
  }

  async getOauthUserByUserId(userId: string): Promise<OauthUser> {
    const query = `SELECT oauth_users.* FROM users
     LEFT JOIN oauth_users ON oauth_users.id = users.oauth_user_id
     WHERE users.id = $1`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [userId]);
    return oauthUser;
  }

  async getPsyqUserAppointments(userId: string): Promise<UserAppointment[]> {
    const query = `SELECT * FROM user_appointments WHERE user_id=$1 AND psyq_appointment_id IS NOT NULL`;
    const userAppointments = await this.database.query<UserAppointment>(query, [
      userId,
    ]);
    return userAppointments;
  }

  async saveUserAppointment(
    input: SaveUserAppointmentInput,
  ): Promise<UserAppointment> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO user_appointments (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [userAppointment] = await this.database.query<UserAppointment>(
      query,
      values,
    );
    return userAppointment;
  }

  async getActiveTreatment(userId: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE user_id = $1 AND is_deleted = $2;`;
    const [treatment] = await this.database.query<Treatment>(query, [
      userId,
      false,
    ]);
    return treatment;
  }

  async saveSchedule(saveSchedule: SaveScheduleInput): Promise<ScheduleEntity> {
    const keys = Object.keys(saveSchedule)
      .map((key) => (key === 'user' ? `"${key}"` : key))
      .join(',');
    const values = Object.values(saveSchedule);
    const placeholders = values
      .map((value, index) => `$${index + 1}`)
      .join(', ');
    const query = `INSERT INTO schedules (${keys}) VALUES (${placeholders}) RETURNING *;`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, values);
    return schedule;
  }
}
