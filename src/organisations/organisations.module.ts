import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { OrganisationsResolver } from './organisations.resolver';
import { OrganisationsService } from './organisations.service';
import { OrganisationsRepo } from './organisations.repo';

@Module({
  imports: [AuthModule],
  providers: [OrganisationsResolver, OrganisationsService, OrganisationsRepo],
})
export class OrganisationsModule {}
