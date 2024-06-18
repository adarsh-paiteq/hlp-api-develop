import { IsNotEmpty, IsString } from 'class-validator';

export class HandleCallbackQuery {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  state: string;
}

export class HandleCallbackResponse {
  url: string;
}
