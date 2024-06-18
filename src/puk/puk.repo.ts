import { Inject, Injectable } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { PUK_API } from './puk.provider';
import { AxiosInstance } from 'axios';
import { Database } from '../core/modules/database/database.service';
import { TestPukUser } from './entities/test-puk.entity';
import {
  ActivityApiArgs,
  ActivityApiResponse,
  PukResendActivationCodeApiResponse,
  PukVerifyApiResponse,
  RegistrationConfirmationApiArgs,
  RegistrationConfirmationApiResponse,
  ResendActivationCodeArgs,
  VerifyPukArgs,
} from './puk.model';

@Injectable()
export class PukRepo {
  constructor(
    private readonly client: HasuraService,
    @Inject(PUK_API) private readonly api: AxiosInstance,
    private readonly database: Database,
  ) {}

  async verifyTestPukCode(code: string): Promise<TestPukUser> {
    const query = `SELECT puk_reference_id,age_group FROM puk_users WHERE activation_code =$1`;
    const [user] = await this.database.query<TestPukUser>(query, [code]);
    return user;
  }

  async verifyPukCode(body: VerifyPukArgs): Promise<PukVerifyApiResponse> {
    const path = `/hlp/code/verify`;
    const { data } = await this.api.post<PukVerifyApiResponse>(path, body);
    return data;
  }

  async resendActivationCode(
    body: ResendActivationCodeArgs,
  ): Promise<PukResendActivationCodeApiResponse> {
    const path = `/hlp/code/reset`;
    const { data } = await this.api.post<PukResendActivationCodeApiResponse>(
      path,
      body,
    );
    return data;
  }

  async pukLogActivity(body: ActivityApiArgs): Promise<ActivityApiResponse> {
    const path = `/hlp/user/activity`;
    const { data } = await this.api.post<ActivityApiResponse>(path, body);
    return data;
  }

  async confirmRegistration(
    body: RegistrationConfirmationApiArgs,
  ): Promise<RegistrationConfirmationApiResponse> {
    const path = `/hlp/confirm-registration`;
    const { data } = await this.api.post<RegistrationConfirmationApiResponse>(
      path,
      body,
    );
    return data;
  }
}
