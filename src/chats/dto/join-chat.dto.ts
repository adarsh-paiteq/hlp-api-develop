import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class JoinChatBody {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  chatId: string;
}
