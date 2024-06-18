import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import axios, { AxiosInstance } from 'axios';
import https from 'https';

export const DIGID_CLIENT = 'DIGID_CLIENT';

export const DigidClient: FactoryProvider<AxiosInstance> = {
  provide: DIGID_CLIENT,
  inject: [ConfigService],
  useFactory(configService: ConfigService) {
    const encodeKey = configService.getOrThrow<string>(
      EnvVariable.DIGID_CERTIFICATE,
    );
    const passphrase = configService.getOrThrow<string>(
      EnvVariable.DIGID_CERTIFICATE_PASSPHRASE,
    );
    const baseURL = configService.getOrThrow<string>(
      EnvVariable.DIGID_OAUTH2_URL,
    );
    const key = Buffer.from(encodeKey, 'base64');

    const httpsAgent = new https.Agent({
      pfx: key,
      passphrase,
    });
    const client = axios.create({
      httpsAgent,
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return client;
  },
};
