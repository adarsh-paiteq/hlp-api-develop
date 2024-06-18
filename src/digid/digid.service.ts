import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import {
  GetAccessTokenBody,
  GetAccessTokenResponse,
} from './dto/get-accesstoken.dto';
import {
  DigidRepo,
  Oauth2ErrorResponse,
  Oauth2ResponseData,
} from './digid.repo';
import {
  HandleCallbackQuery,
  HandleCallbackResponse,
} from './dto/callback.query.dto';
import { AxiosError } from 'axios';
import { BranchIOService } from '@shared/services/branch-io/branch-io.service';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { RedisService } from '@core/modules/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DigidEvent, DigidSessionLogAddedEvent } from './digid.event';
import { GetDigidLoginStatusResponse } from './dto/get-digid-session-status';

@Injectable()
export class DigidService {
  private readonly logger = new Logger(DigidService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly repo: DigidRepo,
    private readonly branchIOService: BranchIOService,
    private readonly firebaseDynamicLinksService: FirebaseDynamicLinksService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getOIDCToken(code: string): Promise<{
    error?: AxiosError<Oauth2ErrorResponse>;
    data?: Oauth2ResponseData;
  }> {
    try {
      const response = await this.repo.getToken(code);
      this.logger.log(`${response.scope}`);
      return { data: response };
    } catch (error) {
      this.logger.error(error?.response?.data);
      return { error };
    }
  }

  async getAccessToken(
    body: GetAccessTokenBody,
  ): Promise<GetAccessTokenResponse> {
    const { error } = await this.getOIDCToken(body.code);
    if (error) {
      return {
        message: error.response?.data?.error_description ?? error.message,
      };
    }
    return { message: 'OK' };
  }

  private prepareRedirectUrl(state: string): string {
    const baseUrl = this.configService.getOrThrow<string>(
      EnvVariable.DIGID_LOGIN_URL,
    );
    const clientId = this.configService.getOrThrow<string>(
      EnvVariable.DIGID_CLIENT_ID,
    );
    const redirectUrl = this.configService.getOrThrow<string>(
      EnvVariable.DIGID_REDIRECT_URL,
    );
    const path = 'oauth2/authorize';

    const url = `${baseUrl}/${path}?scope=openid&response_type=code&client_id=${clientId}&redirect_uri=${redirectUrl}&state=${state}`;
    return url;
  }

  verify(userId: string): { url: string } {
    const url = this.prepareRedirectUrl(userId);
    return { url };
  }

  async addDigidSessionLog(
    userId: string,
    idToken: string,
    expiration: number,
  ): Promise<void> {
    const key = this.redisService.getDigidSessionLogKey(userId);
    await this.redisService.setEx(key, idToken, expiration);
    this.logger.log(`Digid session log added for user: ${userId}`);

    /**@deprecated remove this event later, app team will use getDigidLoginStatus query to get status */
    this.eventEmitter.emit(
      DigidEvent.DIGID_SESSION_LOG_ADDED,
      new DigidSessionLogAddedEvent(userId),
    );
  }

  async handleCallback(
    query: HandleCallbackQuery,
  ): Promise<HandleCallbackResponse | string> {
    const { code, state: userId } = query;

    const { error, data } = await this.getOIDCToken(code);
    if (error) {
      return error.response?.data?.error_description ?? error.message;
    }

    if (data) {
      await this.addDigidSessionLog(userId, data.id_token, data.expires_in);
    }

    return 'OK';
  }

  async getDigidLoginStatus(
    userId: string,
  ): Promise<GetDigidLoginStatusResponse> {
    const key = this.redisService.getDigidSessionLogKey(userId);
    const data = await this.redisService.get(key);
    return { status: !!data };
  }
}
