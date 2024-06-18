import { IsNotEmpty, IsUUID } from 'class-validator';

export class ClearOnboardingRobotLogBodyDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
