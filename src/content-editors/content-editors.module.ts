import { Module } from '@nestjs/common';
import { ContentEditorsService } from './content-editors.service';
import { ContentEditorsResolver } from './content-editors.resolver';
import { ContentEditorsRepo } from './content-editors.repo';
import { AuthModule } from '../shared/auth/auth.module';

@Module({
  providers: [
    ContentEditorsResolver,
    ContentEditorsService,
    ContentEditorsRepo,
  ],
  imports: [AuthModule],
  exports: [ContentEditorsService],
})
export class ContentEditorsModule {}
