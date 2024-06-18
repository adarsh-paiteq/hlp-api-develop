import { Body, Controller, Post } from '@nestjs/common';
import { ShopItemService } from './shop-item.service';
import { Public } from '@shared/decorators/public.decorator';
import { WebhookRequestBody } from '@shared/services/mollie/mollie.dto';

@Controller('shop-item')
export class ShopItemController {
  constructor(private readonly shopItemService: ShopItemService) {}

  @Public()
  @Post('/webhook/mollie')
  async webhookMollie(@Body() body: WebhookRequestBody): Promise<string> {
    return this.shopItemService.webhookMollie(body.id);
  }
}
