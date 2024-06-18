import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtOptions from './jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { ApiGuard } from '../guards/api.guard';
import { AuthService } from './auth.service';
import { OneSignalService } from '@shared/services/one-signal/one-signal';
import { TempJwtStrategy } from './temp-jwt.strategy';
import { DigidJwtStrategy } from './digid-jwt.strategy';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtOptions),
  ],
  providers: [
    JwtStrategy,
    TempJwtStrategy,
    DigidJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ApiGuard,
    },
    AuthService,
    OneSignalService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
