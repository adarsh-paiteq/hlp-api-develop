import { OmitType } from '@nestjs/mapped-types';
import { UserRobotLog } from '../entities/user-robot-log.entity';

export class UserRobotLogDto extends OmitType(UserRobotLog, [
  'created_at',
  'updated_at',
  'id',
]) {}
