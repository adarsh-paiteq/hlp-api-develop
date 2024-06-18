import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 *@description Dto's Used in @function getPoints() that are in goals conroller.
 */
export class GetGoalPointsParams {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

/**
 *@description Dto's Used in @function getPoints() that are in goals conroller,
 and @function getGoalPoint() that are in goals service.
 */
export class GetGoalPointsResponse {
  points: number;
}

/**
 *@description Dto's Used in @function getPoints() that are in goals conroller.
 */
export class GetGoalPointsBody {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
