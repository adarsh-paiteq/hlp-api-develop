import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  RedeemVoucherDto,
  RedeemVoucherResponse,
  ValidateVoucherResponse,
} from './dto/vouchers.dto';
import { VouchersRepo } from './vouchers.repo';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class VouchersService {
  constructor(
    private readonly vouchersRepo: VouchersRepo,
    private readonly translationService: TranslationService,
  ) {}
  private readonly logger = new Logger(VouchersService.name);

  async validateVoucherCode(
    voucherCode: string,
  ): Promise<ValidateVoucherResponse> {
    const shopItemPurchase =
      await this.vouchersRepo.getShopItemPurchaseByVoucher(voucherCode);
    if (!shopItemPurchase) {
      throw new BadRequestException(`vouchers.invalid_voucher_code`);
    }
    const { is_redeemed, item_price } = shopItemPurchase;
    if (is_redeemed) {
      throw new BadRequestException(`vouchers.voucher_code_already_redemmed`);
    }

    return {
      price: item_price,
    };
  }

  async redeemVoucherCode(
    redeemVoucherData: RedeemVoucherDto,
  ): Promise<RedeemVoucherResponse> {
    const { voucherCode, referenceId } = redeemVoucherData;
    const response = await this.validateVoucherCode(voucherCode);
    if (!response) {
      throw new BadRequestException(`vouchers.failed_to_redeem_voucher_code`);
    }
    const shopItemPurchase =
      await this.vouchersRepo.updateShopItemVoucherCodeAsRedeemed(
        voucherCode,
        referenceId,
      );
    if (!shopItemPurchase) {
      throw new BadRequestException(`vouchers.failed_to_redeem_voucher_code`);
    }
    this.logger.log(shopItemPurchase);
    return {
      response: this.translationService.translate(
        `vouchers.successfully_redeemed`,
      ),
    };
  }
}
