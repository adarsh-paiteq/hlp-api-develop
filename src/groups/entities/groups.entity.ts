import { Channel } from '@channels/entities/channel.entity';
import { ObjectType, OmitType } from '@nestjs/graphql';

@ObjectType()
export class Group extends OmitType(Channel, [
  'emoji',
  'emoji_image_file_path',
  'emoji_image_id',
  'emoji_image_url',
  'extra_information_description',
  'extra_information_title',
  'is_tool_kit_linked',
]) {
  is_deleted: boolean;
  updated_by: string;
  created_by: string;
  name_id: string;
}
