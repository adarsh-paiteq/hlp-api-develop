import { ChatFileType } from '@chats/entities/chat-file-upload.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadResponse {
  file_path: string;
  image_url: string;
  file_id: string;
}

export class VideoUploadResponse extends UploadResponse {
  thumbnail_id: string;
  thumbnail_path: string;
  thumbnail_image_url: string;
}

export enum FilePath {
  VIDEO = 'video/',
  AUDIO = 'audio/',
  IMAGE = 'images/',
  DOCUMENT = 'document/',
}

export enum FileType {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

registerEnumType(FileType, { name: 'FileType' });
export class UploadChatAttachmentsDTO {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEnum(ChatFileType, { message: i18nValidationMessage('is_enum') })
  chatFileType: ChatFileType;
}
