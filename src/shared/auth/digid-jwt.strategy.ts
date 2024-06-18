import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { ClsProperty, JwtStrategy, LoggedInUser } from './jwt.strategy';
import { AuthService } from './auth.service';

@Injectable()
export class DigidJwtStrategy extends PassportStrategy(Strategy, 'digid-jwt') {
  private readonly logger = new Logger(DigidJwtStrategy.name);
  constructor(
    readonly configService: ConfigService,
    private readonly clsService: ClsService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('$t'),
      ignoreExpiration: false,
      secretOrKey: authService.getDigidJwtSecret(),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, user: LoggedInUser): Promise<LoggedInUser> {
    await this.jwtStrategy.checkStatus(req, user);
    this.clsService.set(ClsProperty.USER_ID, user.id);
    return user;
  }
}
