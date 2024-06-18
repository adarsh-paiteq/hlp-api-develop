import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import path from 'path';

export enum Template {
  TROPHY_WON = 'trophy-won',
  CONFRIM_EMAIL = 'confirm-email',
  FORGOT_PASSWORD = 'forgot-password',
  FORGOT_PIN = 'forgot-pin',
  VOUCHER_EMAIL = 'voucher-email',
  DOCTOR_FORGOT_PASSWORD = 'doctor-forgot-password',
  DOCTOR_FORGOT_PIN = 'doctor-forgot-pin',
  DOCTOR_CONFIRM_EMAIL = 'doctor-confirm-email',
  PAITENT_INVITATION_EMAIL = 'paitent-invitation-email',
  ORDER_CONFIRMED_EMAIL = 'order-confirmed-email',
  DOCTOR_OTP_LOGIN_EN = 'doctor-otp-login-en',
  DOCTOR_OTP_LOGIN_NL = 'doctor-otp-login-nl',
  DOCTOR_EMAIL_CHANGE_REQUEST = 'doctor-email-change-request',
  SUPPORT_QUESTION = 'support-question',
  FORM_EMAIL = 'form-email',
  USER_OTP_LOGIN = 'user-otp-login',
  TOOLKIT_TIMELINE_MESSAGE_EMAIL = 'toolkit-timeline-message-email',
  APPOINTMENT_EMAIL = 'appointment-email',
  DEFAULT_TIMELINE_MESSAGE_EMAIL = 'default-timeline-message-email',
  CLOSE_TREATMENT_EMAIL = 'close-treatment-email',
  AFTER_CARE_TREATMENT_EMAIL = 'after-care-treatment-email',
  USER_ACTIVATION_CODE_EMAIL = 'user-activation-code-email',
  TREATMENT_FILE_ATTACHED_EMAIL = 'treatment-file-attached-email',
  INACTIVITY_REFRESHER_EMAIL = 'inactivity-refresher-email',
  RESEARCH_APPOINTMENT_EMAIL = 'research-appointment-email',
  INTRODUCTION_VIDEO_EMAIL = 'introduction-video-email',
  OTHER_APPOINTMENT_EMAIL = 'other-appointment-email',
  AGENDA_REMINDER_EMAIL = 'agenda-reminder-email',
  CHANNEL_POST_DELETED_BY_ADMIN = 'channel-post-deleted-by-admin',
  TREATMENT_TEAM_BUDDY_ADDED_EMAIL = 'treatment-team-buddy-added-email',
  GROUP_MEMBER_ADDED_EMAIL = 'group-member-added-email',
  FRIEND_FOLLOWED_EMAIL = 'friend-followed-email',
}

export enum AttachmentTemplate {
  ORDER_CONFIRMED_INVOICE = 'order-confirmed-invoice',
}

@Injectable()
export class TemplateService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.registerEmailPartials();
  }
  private getEmailsRootPath(): string {
    return path.join(__dirname, '../../../../../', `public/views/emails/`);
  }
  private getEmailPartialsRootPath(): string {
    return path.join(
      __dirname,
      '../../../../../',
      `public/views/emails/partials/`,
    );
  }
  private getEmailPartialPath(name: string): string {
    const rootPath = this.getEmailPartialsRootPath();
    const filePath = path.join(rootPath, name);
    return filePath;
  }
  private async getEmailPartials(): Promise<string[]> {
    const rootPath = this.getEmailPartialsRootPath();
    const partials = await fs.readdir(rootPath);
    return partials;
  }
  private async registerEmailPartials(): Promise<void> {
    const partials = await this.getEmailPartials();
    for (const partial of partials) {
      const layoutPath = this.getEmailPartialPath(partial);
      const content = await fs.readFile(layoutPath, 'utf8');
      const [name] = partial.split('.');
      handlebars.registerPartial(name, content);
    }
  }

  private getEmailPath(fileName: string): string {
    const rootPath = this.getEmailsRootPath();
    const filePath = path.join(rootPath, `${fileName}.hbs`);
    return filePath;
  }

  private async compileFile(filePath: string, data: unknown): Promise<string> {
    try {
      const isFile = await fs.stat(filePath);
      if (!isFile.isFile() && !path.extname(filePath).includes('hbs')) {
        throw new BadRequestException(`File type shoud be hbs`);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const content = await fs.readFile(filePath, 'utf8');
    const template = handlebars.compile(content);
    return template(data);
  }

  async getTemplate<T>(name: string, data?: T): Promise<string> {
    const templatePath = this.getEmailPath(name);
    const template = this.compileFile(templatePath, data);
    return template;
  }
}
