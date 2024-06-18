import { Module } from '@nestjs/common';
import { VouchersController } from './vouchers.controller';
import { VouchersRepo } from './vouchers.repo';
import { VouchersService } from './vouchers.service';

@Module({
  controllers: [VouchersController],
  providers: [VouchersRepo, VouchersService],
})
export class VouchersModule {}
