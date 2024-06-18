import { HideField, ObjectType } from '@nestjs/graphql';
import { UserRoles } from '../../users/users.dto';

@ObjectType()
export class ContentEditor {
  @HideField()
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  role: UserRoles;
  image_url: string;
  image_id: string;
  file_path: string;
  id: string;
  updated_at: string;
  created_at: string;
  refresh_token: string;
  status: boolean;
}
