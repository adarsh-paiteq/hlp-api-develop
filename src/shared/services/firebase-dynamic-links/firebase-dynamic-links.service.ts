import {
  FirebaseDynamicLinks,
  ShortLinkRequestBody,
  ShortLinkResponse,
} from 'firebase-dynamic-links';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVariable, Environment } from '@core/configs/config';

export interface DynamicLinkInfo {
  link: string;
}

@Injectable()
export class FirebaseDynamicLinksService {
  private logger = new Logger(FirebaseDynamicLinksService.name);
  private key = this.configService.get<string>(
    'FIREBASE_WEB_API_KEY',
  ) as string;
  private uriPrefix = this.configService.get<string>(
    'FIREBASE_DOMAIN_URI_PREFIX',
  ) as string;
  private firebaseDynamicLinks: FirebaseDynamicLinks;
  constructor(private readonly configService: ConfigService) {
    this.firebaseDynamicLinks = new FirebaseDynamicLinks(this.key);
  }

  public async createfirebaseDynamicLinks(
    path: string,
    webUrl?: string,
  ): Promise<ShortLinkResponse> {
    try {
      const appPackageName = this.configService.get<string>(
        EnvVariable.APP_PACKAGE_NAME,
      ) as string;
      const appStoreID = this.configService.get<string>(
        EnvVariable.APP_STORE_ID,
      ) as string;
      const domain = `https://${this.uriPrefix}`;
      const link = `${domain}${path}`;
      let longDynamicLink = `${domain}?link=${encodeURIComponent(
        link,
      )}&apn=${appPackageName}&ibi=${appPackageName}&isi=${appStoreID}`;
      if (webUrl) {
        longDynamicLink += `&ofl=${encodeURIComponent(webUrl)}`;
      }
      const shortLinkRequestBody: ShortLinkRequestBody = {
        longDynamicLink,
        suffix: {
          option: 'UNGUESSABLE',
        },
      };
      const { shortLink, previewLink } =
        await this.firebaseDynamicLinks.createLink(shortLinkRequestBody);
      return { shortLink: shortLink, previewLink: previewLink };
    } catch (error) {
      this.logger.error(error);
      throw new Error(error.message);
    }
  }

  /**@description to make the deeplink work in app we adding this code as a tempeorary solution. It needs to be removed later. @deprecated*/
  getAppUriSchemeWithPath(
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webUrl?: string,
  ): {
    shortLink: string;
  } {
    const appUriScheme = this.configService.getOrThrow<Environment>(
      EnvVariable.APP_URI_SCHEME,
    );
    return { shortLink: `${appUriScheme}${path}` };
  }
}
