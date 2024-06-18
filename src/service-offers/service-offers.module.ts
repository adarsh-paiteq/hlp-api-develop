import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { ServiceOffersResolver } from './service-offer.resolver';
import { ServiceOffersRepo } from './service-offers.repo';
import { ServiceOffersService } from './service-offers.service';

@Module({
  providers: [ServiceOffersService, ServiceOffersResolver, ServiceOffersRepo],
  imports: [AuthModule],
})
export class ServiceOffersModule {}
