import { Inject, Injectable, Logger } from '@nestjs/common';
import { Mailchimp } from '@core/providers/mailchimp.provider';
import {
  MailchimpListMemberSuccessResponse,
  PingResponse,
  AddOrUpdateUserToMailchimpListResponse,
  MailchimpListMemberBody,
} from '@shared/services/mailchimp/dto/mailchimp.dto';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';

@Injectable()
export class MailchimpService {
  private readonly logger = new Logger(MailchimpService.name);
  constructor(
    @Inject(Mailchimp) private readonly mailchimp: Mailchimp,
    private readonly configService: ConfigService,
  ) {}
  private listId = this.configService.getOrThrow<string>(
    EnvVariable.MAILCHIMP_LIST_ID,
  );

  async ping(): Promise<PingResponse> {
    const path = `/ping`;
    const { data } = await this.mailchimp.get<PingResponse>(path);
    return data;
  }

  async addOrUpdateUserToMailchimpList(
    body: MailchimpListMemberBody,
  ): Promise<AddOrUpdateUserToMailchimpListResponse> {
    try {
      const path = `/lists/${this.listId}/members/${body.email_address}`;

      const { data } =
        await this.mailchimp.put<MailchimpListMemberSuccessResponse>(
          path,
          body,
        );

      return data;
    } catch (error) {
      this.logger.error(`${error.response.data.detail}`);
      if (error.response.data) {
        return error.response.data;
      } else {
        throw error;
      }
    }
  }
}
