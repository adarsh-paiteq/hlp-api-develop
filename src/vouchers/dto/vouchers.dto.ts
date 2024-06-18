import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateVoucherQueryDto {
  @IsString()
  @IsNotEmpty()
  voucherCode: string;
}

export class ValidateVoucherResponse {
  price: number;
}

export class RedeemVoucherDto {
  @IsString()
  @IsNotEmpty()
  voucherCode: string;

  @IsString()
  @IsNotEmpty()
  referenceId: string;
}

export class RedeemVoucherResponse {
  response: string;
}
