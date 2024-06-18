import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { Public } from '@shared/decorators/public.decorator';
import {
  RedeemVoucherDto,
  RedeemVoucherResponse,
  ValidateVoucherQueryDto,
  ValidateVoucherResponse,
} from './dto/vouchers.dto';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Public()
  @Get('/validate')
  async validateVoucherCode(
    @Query() query: ValidateVoucherQueryDto,
  ): Promise<ValidateVoucherResponse> {
    return this.vouchersService.validateVoucherCode(query.voucherCode);
  }

  @Public()
  @Put('/redeem')
  async redeemVoucherCode(
    @Body() body: RedeemVoucherDto,
  ): Promise<RedeemVoucherResponse> {
    return this.vouchersService.redeemVoucherCode(body);
  }
}
