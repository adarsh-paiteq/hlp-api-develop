import { UserStatus } from '@users/entities/user-status-info.entity';

export class InsertDoctorStatusLogs {
  user_id: string;
  previous_status: string;
  new_status: UserStatus;
  status_changed_by: string;
}
