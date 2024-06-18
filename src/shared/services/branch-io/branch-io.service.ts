import { EnvVariable } from '@core/configs/config';
import { BRANCH_IO, BranchIO } from '@core/providers/branch-io.provider';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateDeepLinkBody,
  CreateDeepLinkUrlResponse,
  DeepLinkData,
} from './dto/branch-io.dto';

@Injectable()
export class BranchIOService {
  private readonly logger = new Logger(BranchIOService.name);
  constructor(
    @Inject(BRANCH_IO) private readonly branchIO: BranchIO,
    private readonly configService: ConfigService,
  ) {}

  private get branchKey(): string {
    const key = this.configService.getOrThrow<string>(
      EnvVariable.BRANCH_IO_API_KEY,
    );
    return key;
  }

  async createDeepLinkUrl(
    data: DeepLinkData,
  ): Promise<CreateDeepLinkUrlResponse> {
    const path = `/v1/url`;

    const body: CreateDeepLinkBody = {
      branch_key: this.branchKey,
      data: data,
    };

    const result = await this.branchIO.post<CreateDeepLinkUrlResponse>(
      path,
      body,
    );

    return result.data;
  }

  async getDeepLink(
    deepLinkPath: string,
    webUrl?: string,
  ): Promise<{ shortLink: string }> {
    const data: DeepLinkData = {
      $deeplink_path: deepLinkPath,
    };

    if (webUrl) {
      data.$desktop_url = webUrl;
    }

    const { url } = await this.createDeepLinkUrl(data);
    return { shortLink: url };
  }
}
