import { Module } from '@nestjs/common';
import { AdminPostReadsService } from './admin-post-reads.service';
import { AdminPostReadsResolver } from './admin-post-reads.resolver';
import { AdminPostReadsRepo } from './admin-post-reads.repo';
import { AuthModule } from '../shared/auth/auth.module';

@Module({
  providers: [
    AdminPostReadsResolver,
    AdminPostReadsService,
    AdminPostReadsRepo,
  ],
  imports: [AuthModule],
})
export class AdminPostReadsModule {}
