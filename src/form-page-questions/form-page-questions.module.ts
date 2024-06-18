import { Module } from '@nestjs/common';
import { FormPageQuestionsService } from './form-page-questions.service';
import { FormPageQuestionsResolver } from './form-page-questions.resolver';
import { FormPageQuestionsRepo } from './form-page-questions.repo';
import { AuthModule } from '../shared/auth/auth.module';

@Module({
  providers: [
    FormPageQuestionsResolver,
    FormPageQuestionsService,
    FormPageQuestionsRepo,
  ],
  imports: [AuthModule],
})
export class FormPageQuestionsModule {}
