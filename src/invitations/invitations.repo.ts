import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { Doctor } from '../doctors/entities/doctors.entity';
import {
  InsertAddOauthUser,
  InsertPatientInvitation,
  UpdateOauthUser,
  UpdatePatientInvitation,
} from './dto/invite-patient.dto';
import { PatientInvitation } from './entities/patient-invitations.entity';
import { Users } from '../users/users.model';
import { GetPatientInvitation } from './dto/invitations.dto';
import {
  OauthUser,
  UserRegistrationStatus,
} from '@oauth/entities/oauth-users.entity';

@Injectable()
export class InvitationsRepo {
  constructor(private readonly database: Database) {}

  async getDoctorById(id: string): Promise<Doctor | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const [doctor] = await this.database.query<Doctor>(query, [id]);
    return doctor;
  }

  async getPatientInvitation(
    search: GetPatientInvitation,
  ): Promise<PatientInvitation | null> {
    let query = 'SELECT * FROM patient_invitations WHERE';
    const queryParams: unknown[] = [];

    if (search.email) {
      query += ' email = $1';
      queryParams.push(search.email);
    } else if (search.id) {
      query += ' id = $1';
      queryParams.push(search.id);
    } else {
      return null;
    }

    const [patientInvitation] = await this.database.query<PatientInvitation>(
      query,
      queryParams,
    );

    return patientInvitation;
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const [user] = await this.database.query<Users>(query, [email]);
    return user;
  }

  async insertPatientInvitation(
    patientInvitation: InsertPatientInvitation,
  ): Promise<PatientInvitation> {
    const keys = Object.keys(patientInvitation);
    const values = Object.values(patientInvitation);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO patient_invitations (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [invitation] = await this.database.query<PatientInvitation>(
      query,
      values,
    );

    return invitation;
  }

  async updatePatientInvitation(
    updatePatientInvitation: UpdatePatientInvitation,
    email: string,
  ): Promise<PatientInvitation> {
    const keys = Object.keys(updatePatientInvitation);
    const values = Object.values(updatePatientInvitation);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE patient_invitations SET ${setFields} WHERE email = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, email];

    const [invitation] = await this.database.query<PatientInvitation>(
      query,
      updateValues,
    );

    return invitation;
  }

  async getOauthUserByActivationCode(
    code: string,
  ): Promise<OauthUser | undefined> {
    const query = `SELECT * FROM oauth_users where activation_code = $1`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [code]);
    return oauthUser;
  }

  async insertOauthUser(
    oauthUserInput: InsertAddOauthUser,
  ): Promise<OauthUser> {
    const keys = Object.keys(oauthUserInput);
    const values = Object.values(oauthUserInput);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO oauth_users (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [oauthUser] = await this.database.query<OauthUser>(query, values);

    return oauthUser;
  }

  async getOauthUserWithStatusAndEmail(
    email: string,
    status: UserRegistrationStatus,
  ): Promise<OauthUser> {
    const query = `SELECT * FROM oauth_users WHERE email ILIKE $1 AND status=$2`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [
      email,
      status,
    ]);
    return oauthUser;
  }

  async updateOauthUser(
    update: UpdateOauthUser,
    email: string,
  ): Promise<OauthUser> {
    const keys = Object.keys(update);
    const values = Object.values(update);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE oauth_users SET ${setFields} WHERE email = $${
      keys.length + 1
    } RETURNING *;`;

    const updateValues = [...values, email];

    const [oauthUser] = await this.database.query<OauthUser>(
      query,
      updateValues,
    );

    return oauthUser;
  }
}
