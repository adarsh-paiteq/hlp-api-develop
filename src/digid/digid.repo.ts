import { Inject, Injectable } from '@nestjs/common';
import { DIGID_CLIENT } from './digid.provider';
import { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import querystring from 'querystring';

export interface Oauth2ResponseData {
  access_token: string;
  token_type: string;
  id_token: string;
  expires_in: number;
  scope: string;
}

export interface Oauth2ErrorResponse {
  error: string;
  error_description: string;
}

@Injectable()
export class DigidRepo {
  constructor(
    @Inject(DIGID_CLIENT) private readonly client: AxiosInstance,
    private readonly configService: ConfigService,
  ) {}

  async getToken(code: string): Promise<Oauth2ResponseData> {
    const username = this.configService.getOrThrow<string>(
      EnvVariable.DIGID_CLIENT_ID,
    );
    const password = this.configService.getOrThrow<string>(
      EnvVariable.DIGID_CLIENT_SECRET,
    );
    const redirectUrl = this.configService.getOrThrow<string>(
      EnvVariable.DIGID_REDIRECT_URL,
    );
    const path = '/oauth2/token';
    const { data } = await this.client.post<Oauth2ResponseData>(
      path,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUrl,
      }),
      { auth: { username, password } },
    );
    return data;
  }
}
