import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsResolver } from './campaigns.resolver';
import { CampaignsRepo } from './campaigns.repo';
import { AuthModule } from '../shared/auth/auth.module';

@Module({
  providers: [CampaignsResolver, CampaignsService, CampaignsRepo],
  imports: [AuthModule],
})
export class CampaignsModule {}
