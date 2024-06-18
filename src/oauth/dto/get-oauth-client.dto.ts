import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { OauthClient } from '../entities/oauth-clients.entity';

export class GetOauthClientParams {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  id: string;
}

export class GetOauthClientResponse {
  message: string;
  client: OauthClient;
}
