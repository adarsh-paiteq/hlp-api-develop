import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { FileType } from '@uploads/upload.dto';

export enum TimelineAttachmentType {
  NOTE = 'NOTE',
  FILE = 'FILE',
}
registerEnumType(TimelineAttachmentType, { name: 'TimelineAttachmentType' });
@ObjectType()
export class TreatmentTimelineAttachment {
  id: string;
  file_url?: string;
  file_id?: string;
  file_path?: string;
  file_type?: FileType;
  thumbnail_image_url?: string;
  thumbnail_image_id?: string;
  thumbnail_image_path?: string;
  is_private_note: boolean;
  type: TimelineAttachmentType;
  title: string;
  description: string;
  created_by: string;
  @Field(() => String)
  created_at: Date;
  @Field(() => String)
  updated_at: Date;
}
