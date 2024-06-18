import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OneSignalService } from '@shared/services/one-signal/one-signal';
import * as bcrypt from 'bcrypt';
import { GenerateTokens } from '../../users/users.model';
import { UserRoles } from '../../users/users.dto';
import { LoggedInUser } from './jwt.strategy';
import { REDIS } from '@core/modules/redis/redis.provider';
import { Redis } from 'ioredis';
import { DateTime } from 'luxon';
import { authenticator, totp } from 'otplib';
import { HashAlgorithms } from 'otplib/core';
import { TokenExpiredError } from 'jsonwebtoken';
import { VideoCallTokenPayload } from '../../video-calls/dto/generate-video-call-token.dto';
import { EnvVariable } from '@core/configs/config';

export interface IGetTokens {
  id: string;
  role: string;
  email: string;
  organization_id?: string;
  is_onboarded?: boolean;
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
  sub: string;
  jti?: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenExpiration = 1 * 86400; // one day
  private readonly deletedUsersKeyPrefix = 'deleted:users';
  private readonly deletedTokensKeyPrefix = 'deleted:tokens';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly oneSignalService: OneSignalService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  private getJwtRefreshSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET') as string;
    const refreshSecret = secret.slice(0, secret.length - 5);
    return refreshSecret;
  }

  validateApiToken(apiKey: string): boolean {
    const token = this.configService.get('API_TOKEN');
    if (!apiKey || String(token) !== String(apiKey)) {
      throw new ForbiddenException();
    }
    return true;
  }

  validateOauthApiToken(apiKey: string): boolean {
    const token = this.configService.getOrThrow(EnvVariable.OAUTH_API_TOKEN);
    if (!apiKey || String(token) !== String(apiKey)) {
      throw new ForbiddenException();
    }
    return true;
  }

  private async getAccessToken(
    user: IGetTokens,
    expiration = this.accessTokenExpiration,
  ): Promise<string> {
    const hasuraClaims = this.getHasuraJwtClaims(user);
    const payload = {
      id: user.id,
      organization_id: user.organization_id,
      is_onboarded: user.is_onboarded,
      ...hasuraClaims,
      role: user.role,
    };
    return await this.jwtService.signAsync(payload, {
      subject: user.id,
      expiresIn: expiration,
    });
  }

  private async getRefreshToken(
    user: IGetTokens,
    expiration = this.accessTokenExpiration,
  ): Promise<string> {
    const secret = this.getJwtRefreshSecret();
    const payload = {
      id: user.id,
    };
    return await this.jwtService.signAsync(payload, {
      subject: user.id,
      expiresIn: 7 * expiration,
      secret,
    });
  }

  async getTokens(
    user: IGetTokens,
    expiration = this.accessTokenExpiration,
  ): Promise<GenerateTokens> {
    const [accessToken, refreshToken, externalUserIdAuthHash, emailAuthHash] =
      await Promise.all([
        this.getAccessToken(user, expiration),
        this.getRefreshToken(user, expiration),
        this.oneSignalService.generateAuthHash(user.id),
        this.oneSignalService.generateAuthHash(user.email),
      ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiration,
      external_user_id_auth_Hash: externalUserIdAuthHash,
      email_auth_hash: emailAuthHash,
      id: user.id,
    };
  }

  async verifyRefreshToken(token: string) {
    try {
      const secret = this.getJwtRefreshSecret();
      const data = await this.jwtService.verifyAsync(token, { secret });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  async verifyToken(token: string) {
    try {
      const data = await this.jwtService.verifyAsync(token);
      return { data };
    } catch (error) {
      return { error };
    }
  }

  private getHasuraJwtClaims(user: IGetTokens) {
    return {
      'https://hasura.io/jwt/claims': {
        'x-hasura-allowed-roles': [user.role],
        'x-hasura-default-role': user.role,
        'x-hasura-user-id': user.id,
      },
    };
  }

  hashPassword(password: string): string {
    const saltOrRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltOrRounds);
    return passwordHash;
  }
  compareHash(data: string, hash: string): boolean {
    return bcrypt.compareSync(data, hash);
  }
  generateHash(data: string): string {
    const saltOrRounds = 10;
    const passwordHash = bcrypt.hashSync(data, saltOrRounds);
    return passwordHash;
  }
  validateRoles(user: LoggedInUser, roles: UserRoles[]): boolean {
    if (!roles.includes(user.role)) {
      throw new ForbiddenException();
    }
    return true;
  }

  private getChagePasswordSecret(): string {
    const secret = this.getJwtRefreshSecret();
    return secret + '';
  }

  generateChangePasswordToken(user: IGetTokens) {
    const secret = this.getChagePasswordSecret();
    return this.generateToken(secret, user);
  }

  async verifyChangePasswordToken(token: string) {
    const secret = this.getJwtRefreshSecret();
    return this.verifyJwtToken(secret, token);
  }

  async generateToken(secret: string, user: IGetTokens): Promise<string> {
    const payload = {
      id: user.id,
    };
    return await this.jwtService.signAsync(payload, {
      subject: user.id,
      expiresIn: '1d',
      secret,
    });
  }

  async verifyJwtToken(secret: string, token: string) {
    try {
      const data = await this.jwtService.verifyAsync(token, { secret });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  private getEmailVerificationSecret(): string {
    const secret = this.getJwtRefreshSecret();
    return secret + 'email';
  }

  async generateEmailVerificationToken(user: IGetTokens): Promise<string> {
    const secret = this.getEmailVerificationSecret();
    return this.generateToken(secret, user);
  }

  private getPatientInvitationEmailTokenSecret(): string {
    const secret = this.getJwtRefreshSecret();
    return secret + 'invite-patient';
  }

  async generatePatientInvitationEmailToken(
    invitationId: string,
    jwtid: string,
  ): Promise<string> {
    const secret = this.getPatientInvitationEmailTokenSecret();
    const expiresIn = 72 * 60 * 60; // 72 hours
    const token = await this.jwtService.signAsync(
      { id: invitationId },
      {
        subject: invitationId,
        secret: secret,
        expiresIn,
        jwtid,
      },
    );
    return token;
  }

  async verifyPatientInvitationEmailToken(token: string): Promise<JwtPayload> {
    const secret = this.getPatientInvitationEmailTokenSecret();
    try {
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(`invitations.invalid_token`);
      }
      throw new BadRequestException(error.message);
    }
  }

  async verifyEmailVerificationToken(token: string) {
    const secret = this.getEmailVerificationSecret();
    return this.verifyJwtToken(secret, token);
  }

  async blockUserAccessToken(
    userId: string,
    token: string,
    expiration: number,
  ): Promise<void> {
    const expirationTime = DateTime.fromSeconds(expiration);
    const { seconds } = expirationTime.diffNow('second').toObject();
    const key = `${this.deletedTokensKeyPrefix}:${userId}`;
    await this.redis.setex(key, Math.floor(seconds as number), token);
  }

  async isTokenBlocked(userId: string): Promise<boolean> {
    const key = `${this.deletedTokensKeyPrefix}:${userId}`;
    const data = await this.redis.get(key);
    return data !== null;
  }

  async isUserDeleted(id: string): Promise<boolean> {
    const key = this.deletedUsersKeyPrefix;
    const data = await this.redis.hget(key, id);
    return data !== null;
  }

  async blockUser(userId: string): Promise<void> {
    const key = this.deletedUsersKeyPrefix;
    await this.redis.hset(key, [userId, userId]);
  }

  async unBlockUser(userId: string): Promise<void> {
    const key = this.deletedUsersKeyPrefix;
    await this.redis.hdel(key, userId);
  }

  async generateSecret(): Promise<string> {
    const sec = authenticator.generateSecret();
    return sec;
  }

  async generateOTP(secret: string): Promise<string> {
    totp.options = {
      algorithms: HashAlgorithms,
      digits: 4,
      epoch: Date.now(),
      step: 60 * 30,
      window: 5,
    };
    const token = totp.generate(secret);
    return token;
  }

  public async verifyOTP(otp: number, secret: string): Promise<boolean> {
    return totp.verify({ token: String(otp), secret });
  }

  async generateVideoCallToken(
    payload: VideoCallTokenPayload,
  ): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET') as string;
    const token = await this.jwtService.signAsync(payload, {
      secret: secret,
    });
    return token;
  }

  async generateTempAccessToken(
    payload: IGetTokens,
    expiresIn: number,
  ): Promise<string> {
    const secret = this.configService.get<string>('TEMP_JWT_SECRET') as string;
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
    return token;
  }

  /**
   * @description at the time of doctor login we need to generate  temp tokens,
   *  so that they can use that token to verify the otp
   */
  async getTempTokens(
    user: IGetTokens,
    expiration = this.accessTokenExpiration,
  ): Promise<GenerateTokens> {
    const payload: IGetTokens = {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    };
    const accessToken = await this.generateTempAccessToken(payload, expiration);
    return {
      access_token: accessToken,
      refresh_token: '',
      token_type: 'Bearer',
      expires_in: expiration,
      external_user_id_auth_Hash: '',
      email_auth_hash: '',
      id: user.id,
    };
  }

  async verifyWsToken(token: string) {
    const secret = this.configService.get<string>('JWT_SECRET') as string;
    return this.verifyJwtToken(secret, token);
  }

  async verifyTempAccessToken(token: string) {
    const secret = this.configService.get<string>('TEMP_JWT_SECRET') as string;
    return this.verifyJwtToken(secret, token);
  }

  getDigidJwtSecret(): string {
    const secret = this.configService.get<string>('TEMP_JWT_SECRET') as string;
    return secret + 'digid';
  }

  /**
   * @description Used to generate the token to authenticate the verify digid login api
   */
  async getDigidJwtToken(userId: string): Promise<string> {
    const secret = this.getDigidJwtSecret();
    const expiration = 60; // 1 minute
    const token = await this.jwtService.signAsync(
      { id: userId },
      {
        secret,
        expiresIn: expiration,
      },
    );
    return token;
  }
}
