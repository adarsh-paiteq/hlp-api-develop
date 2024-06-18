import { IsNotEmpty, IsString } from 'class-validator';

export class GetAccessTokenBody {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class GetAccessTokenResponse {
  message: string;
}
