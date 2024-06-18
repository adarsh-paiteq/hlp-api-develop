import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';
import { ClsProperty, JwtStrategy, LoggedInUser } from './jwt.strategy';

@Injectable()
export class TempJwtStrategy extends PassportStrategy(Strategy, 'temp-jwt') {
  private readonly logger = new Logger(TempJwtStrategy.name);
  constructor(
    readonly configService: ConfigService,
    private readonly clsService: ClsService,
    private readonly jwtStrategy: JwtStrategy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('TEMP_JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, user: LoggedInUser): Promise<LoggedInUser> {
    await this.jwtStrategy.checkStatus(req, user);
    this.clsService.set(ClsProperty.USER_ID, user.id);
    return user;
  }
}
