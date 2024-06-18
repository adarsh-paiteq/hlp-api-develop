import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { OauthClient } from './entities/oauth-clients.entity';
import { AddOauthClientInput } from './dto/add-oauth-client.dto';
import { Organisation } from '@organisations/entities/organisations.entity';
import { Users } from '@users/users.model';
import {
  OauthUser,
  UserRegistrationStatus,
} from './entities/oauth-users.entity';
import { AddOauthUser } from './dto/add-outh-user.dto';

@Injectable()
export class OauthRepo {
  constructor(private readonly database: Database) {}

  async getOrganisationById(organisationId: string): Promise<Organisation> {
    const query = 'SELECT * FROM organisations WHERE id = $1 ';
    const [organisation] = await this.database.query<Organisation>(query, [
      organisationId,
    ]);
    return organisation;
  }

  async addOauthClient(
    oauthClientInput: AddOauthClientInput,
  ): Promise<OauthClient> {
    const keys = Object.keys(oauthClientInput);
    const values = Object.values(oauthClientInput);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO oauth_clients (${columns}) VALUES (${placeholders}) RETURNING *;`;

    const [oauthClient] = await this.database.query<OauthClient>(query, values);
    return oauthClient;
  }

  async getOauthClientById(clientId: string): Promise<OauthClient> {
    const query = 'SELECT * FROM oauth_clients WHERE client_id = $1 ';
    const [oauthClient] = await this.database.query<OauthClient>(query, [
      clientId,
    ]);
    return oauthClient;
  }

  async getUserByEmail(email: string): Promise<Users> {
    const query = `SELECT * FROM users where email ILIKE $1`;
    const [user] = await this.database.query<Users>(query, [email]);
    return user;
  }

  async getOauthUserByEmail(email: string): Promise<OauthUser> {
    const query = `SELECT * FROM oauth_users where email ILIKE $1`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [email]);
    return oauthUser;
  }

  async addOauthUser(oauthUserInput: AddOauthUser): Promise<OauthUser> {
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
  async getOrganisationPatient(
    organisationPatientId: string,
  ): Promise<OauthUser | undefined> {
    const query =
      'SELECT * FROM oauth_users WHERE organisation_patient_id = $1 ';
    const [oauthUser] = await this.database.query<OauthUser>(query, [
      organisationPatientId,
    ]);
    return oauthUser;
  }
  async getOauthUserByActivationCode(
    code: string,
  ): Promise<OauthUser | undefined> {
    const query = `SELECT * FROM oauth_users where activation_code = $1`;
    const [oauthUser] = await this.database.query<OauthUser>(query, [code]);
    return oauthUser;
  }
}
