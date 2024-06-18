import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRoles } from '../../users/users.dto';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { AuthService } from './auth.service';

export interface HttpsHasuraIoJwtClaims {
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
  'x-hasura-user-id': string;
}

export enum ClsProperty {
  USER_ID = 'userId',
}

export class LoggedInUser {
  id: string;
  organization_id?: string;
  is_onboarded: boolean;
  'https://hasura.io/jwt/claims': HttpsHasuraIoJwtClaims;
  role: UserRoles;
  iat: number;
  exp: number;
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    readonly configService: ConfigService,
    private readonly clsService: ClsService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('$t'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async checkStatus(req: Request, user: LoggedInUser): Promise<void> {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const [isTokenBlocked, isUserDeleted] = await Promise.all([
      this.authService.isTokenBlocked(user.id),
      this.authService.isUserDeleted(user.id),
    ]);
    if (isUserDeleted && !isTokenBlocked && accessToken) {
      await this.authService.blockUserAccessToken(
        user.id,
        accessToken,
        user.exp,
      );
      this.logger.warn(`User is deleted blocking token`);
    }
    if (isUserDeleted || isTokenBlocked) {
      this.logger.warn(`User is deleted or token blocked`);
      throw new UnauthorizedException();
    }
  }

  async validate(req: Request, user: LoggedInUser): Promise<LoggedInUser> {
    await this.checkStatus(req, user);
    this.clsService.set(ClsProperty.USER_ID, user.id);
    return user;
  }
}
