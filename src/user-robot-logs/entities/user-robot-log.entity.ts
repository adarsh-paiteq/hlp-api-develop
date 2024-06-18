import { RobotPageType, RobotType } from '../../robots/entities/robot.entity';

export class UserRobotLog {
  id: string;
  user_id: string;
  date: string;
  session_log_id?: string;
  robot_type: RobotType;
  robot_id?: string;
  created_at: string;
  updated_at: string;
  page?: RobotPageType;
}
