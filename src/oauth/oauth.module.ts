import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { OauthService } from './oauth.service';
import { OauthRepo } from './oauth.repo';
import { OauthController } from './oauth.controller';
import { UsersModule } from '@users/users.module';
import { OauthResolver } from './oauth.resolver';
import { EmailsModule } from '@emails/emails.module';
import { UtilsModule } from '@utils/utils.module';

@Module({
  imports: [AuthModule, UsersModule, UtilsModule, EmailsModule],
  controllers: [OauthController],
  providers: [OauthService, OauthRepo, OauthResolver],
})
export class OauthModule {}
