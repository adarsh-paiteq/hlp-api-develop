import {
  UserStatus,
  UserStatusChangedBy,
} from '@users/entities/user-status-info.entity';

export class AddUserStatusInfo {
  status: UserStatus;
  user_id: string;
  status_changed_by: UserStatusChangedBy;
}
