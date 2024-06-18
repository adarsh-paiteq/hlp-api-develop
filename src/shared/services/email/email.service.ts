import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  SESv2ClientConfig,
  SESv2,
  SendEmailCommandInput,
  SendEmailCommandOutput,
  CreateEmailTemplateCommandInput,
  CreateEmailTemplateRequest,
  CreateEmailTemplateCommandOutput,
  UpdateEmailTemplateCommandInput,
  UpdateEmailTemplateCommandOutput,
  SendBulkEmailCommandInput,
  BulkEmailEntry,
  BulkEmailStatus,
  DeleteEmailTemplateCommandInput,
  DeleteEmailTemplateCommandOutput,
  BulkEmailEntryResult,
} from '@aws-sdk/client-sesv2';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import nodemailer, {
  SentMessageInfo,
  createTransport,
  SendMailOptions,
} from 'nodemailer';
import AWS, { config } from 'aws-sdk';
import { Readable } from 'stream';

interface Keys {
  secretAccessKey: string;
  accessKeyId: string;
  region: string;
}

export interface SendEmailInput {
  receiverEmail: string[];
  subject: string;
  body: string;
}

export interface Attachment {
  contentType?: string;
  content: string | Buffer | Readable | undefined;
  filename: string;
}

export interface SendEmailAttachmentInput {
  receiverEmail: string;
  subject: string;
  body: string;
  attachments: Attachment[];
}

export enum SesTemplates {
  INTRODUCTION_VIDEO = 'introduction-video',
  INACTIVITY_REFRESHER = 'inactivity-refresher',
  AGENDA_REMINDER = 'agenda-reminder',
  SHOP_ITEM_PURCHASE = 'shop-item-purchase',
  TROPHY_ACHIEVED = 'trophy-achieved',
  CHANNEL_POST_DELETED_BY_ADMIN = 'channel-post-deleted-by-admin',
}

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    this.init();
  }
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmailAddress = this.configService.get(
    EnvVariable.AWS_SES_VERIFIED_EMAIL,
  );
  private SES: SESv2;

  private getKeys(): Keys {
    const secretAccessKey = this.configService.get(EnvVariable.AWS_SECRET);
    const accessKeyId = this.configService.get(EnvVariable.AWS_ACCESS_KEY);
    const region = this.configService.get(EnvVariable.AWS_REGION);
    return { secretAccessKey, accessKeyId, region };
  }
  private transporter: nodemailer.Transporter;

  private init(): void {
    const { region, secretAccessKey, accessKeyId } = this.getKeys();
    const sesConfig: SESv2ClientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };
    this.SES = new SESv2(sesConfig);

    config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
    });

    this.transporter = createTransport({
      SES: new AWS.SES({
        region: region,
      }),
    });
  }

  async sendEmail(emailInput: SendEmailInput): Promise<SendEmailCommandOutput> {
    const { receiverEmail, subject, body } = emailInput;
    const params: SendEmailCommandInput = {
      FromEmailAddress: this.fromEmailAddress,
      Destination: {
        ToAddresses: receiverEmail,
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: body,
            },
          },
        },
      },
    };

    try {
      return this.SES.sendEmail(params);
    } catch (error) {
      this.logger.error(`${this.sendEmail.name} : ${error}`);
      throw error;
    }
  }

  async createEmailTemplate(
    args: CreateEmailTemplateRequest,
  ): Promise<CreateEmailTemplateCommandOutput> {
    const { TemplateContent, TemplateName } = args;
    const params: CreateEmailTemplateCommandInput = {
      TemplateName,
      TemplateContent,
    };

    try {
      return this.SES.createEmailTemplate(params);
    } catch (error) {
      this.logger.error(`${this.createEmailTemplate.name} : ${error}`);
      throw error;
    }
  }

  async updateEmailTemplate(
    args: UpdateEmailTemplateCommandInput,
  ): Promise<UpdateEmailTemplateCommandOutput> {
    const { TemplateContent, TemplateName } = args;
    const params: UpdateEmailTemplateCommandInput = {
      TemplateName,
      TemplateContent,
    };

    try {
      return this.SES.updateEmailTemplate(params);
    } catch (error) {
      this.logger.error(`${this.updateEmailTemplate.name} : ${error}`);
      throw error;
    }
  }

  async deleteEmailTemplate(
    args: DeleteEmailTemplateCommandInput,
  ): Promise<DeleteEmailTemplateCommandOutput> {
    const { TemplateName } = args;
    const params: DeleteEmailTemplateCommandInput = {
      TemplateName,
    };
    try {
      return this.SES.deleteEmailTemplate(params);
    } catch (error) {
      this.logger.error(`${this.deleteEmailTemplate.name} : ${error}`);
      throw error;
    }
  }

  async sendBulkEmails(
    bulkEmailEntry: BulkEmailEntry[],
    templateName: SesTemplates,
  ): Promise<{
    success: BulkEmailEntryResult[];
    failed: BulkEmailEntryResult[];
  }> {
    const params: SendBulkEmailCommandInput = {
      FromEmailAddress: this.fromEmailAddress,
      DefaultContent: {
        Template: {
          TemplateName: templateName,
          //reuquired empty object string
          TemplateData: '{}',
        },
      },
      BulkEmailEntries: bulkEmailEntry,
    };

    try {
      const { BulkEmailEntryResults: bulkEmailEntryResults } =
        await this.SES.sendBulkEmail(params);

      if (!bulkEmailEntryResults) {
        throw new BadRequestException('failed to send bulk emails');
      }
      const successResults = bulkEmailEntryResults.filter(
        (entryResult) => entryResult.Status === BulkEmailStatus.SUCCESS,
      );

      const failedResults = bulkEmailEntryResults.filter(
        (entryResult) => entryResult.Status !== BulkEmailStatus.SUCCESS,
      );

      return {
        success: successResults,
        failed: failedResults,
      };
    } catch (error) {
      this.logger.error(`${this.sendBulkEmails.name} : ${error}`);
      throw error;
    }
  }

  async sendEmailWithAttachments(
    emailInput: SendEmailAttachmentInput,
  ): Promise<SentMessageInfo> {
    const { receiverEmail, subject, body, attachments } = emailInput;
    const emailParams: SendMailOptions = {
      from: this.fromEmailAddress,
      to: receiverEmail,
      subject: subject,
      html: body,
      attachments: attachments,
    };
    try {
      return await this.transporter.sendMail(emailParams);
    } catch (error) {
      this.logger.error(`${this.sendEmailWithAttachments.name} : ${error}`);
      throw error;
    }
  }
}
