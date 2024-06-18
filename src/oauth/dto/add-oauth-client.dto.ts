import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddOauthClientBody {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  organization_id: string;
}

export class AddOauthClientResponse {
  message: string;
  client_id: string;
  client_secret: string;
}

export class AddOauthClientInput {
  client_id: string;
  client_secret: string;
  organization_id: string;
  grants: string[];
}
