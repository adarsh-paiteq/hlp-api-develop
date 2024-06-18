import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { FaqRepo } from './faq.repo';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';

@Module({
  imports: [AuthModule],
  providers: [FaqService, FaqResolver, FaqResolver, FaqRepo],
})
export class FaqModule {}
