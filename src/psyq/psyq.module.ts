import { Module } from '@nestjs/common';
import { PsyqService } from './psyq.service';
import { PsyqController } from './psyq.controller';
import { PsyqRepo } from './psyq.repo';
import { PsyqClient } from './psyq.provider';
import { AuthModule } from '@shared/auth/auth.module';
import { PsyqResolver } from './psyq.resolver';
import { UtilsModule } from '@utils/utils.module';
import { UploadsModule } from '@uploads/uploads.module';

@Module({
  imports: [AuthModule, UtilsModule, UploadsModule],
  controllers: [PsyqController],
  providers: [PsyqService, PsyqRepo, PsyqClient, PsyqResolver],
  exports: [PsyqService, PsyqRepo, PsyqClient],
})
export class PsyqModule {}
