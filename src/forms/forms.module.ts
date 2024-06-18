import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { FormsRepo } from './forms.repo';
import { FormsResolver } from './forms.resolver';
import { FormsService } from './forms.service';
import { UtilsModule } from '@utils/utils.module';

@Module({
  providers: [FormsResolver, FormsService, FormsRepo],
  imports: [AuthModule, UtilsModule],
  exports: [FormsRepo],
})
export class FormsModule {}
