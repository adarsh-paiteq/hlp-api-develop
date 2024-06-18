import { Module } from '@nestjs/common';
import { ShopItemService } from './shop-item.service';
import { ShopItemResolver } from './shop-item.resolver';
import { ShopItemRepo } from './shop-item.repo';
import { AuthModule } from '@shared/auth/auth.module';
import { UsersModule } from '@users/users.module';
import { MollieService } from '@shared/services/mollie/mollie.service';
import { ShopItemController } from './shop-item.controller';

@Module({
  controllers: [ShopItemController],
  imports: [AuthModule, UsersModule],

  providers: [ShopItemService, ShopItemResolver, ShopItemRepo, MollieService],
})
export class ShopItemModule {}
