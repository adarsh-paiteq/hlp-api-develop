import { BulkEmailEntry, SendEmailCommandOutput } from '@aws-sdk/client-sesv2';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  EmailService,
  SendEmailAttachmentInput,
  SesTemplates,
} from '../shared/services/email/email.service';
import {
  AttachmentTemplate,
  Template,
  TemplateService,
} from '../shared/services/template/template.service';
import { EmailsContent } from './emails.content';
import { EmailsQueue } from './emails.queue';
import { EmailsRepo } from './emails.repo';
import { DateTime } from 'luxon';
import {
  GetLayoutTranslationResponse,
  GetTranslationResponse,
  introductionVideoEmailSubject,
  introductionVideoTableName,
  VideoEmailData,
  VideoEmailType,
} from './emails.dto';
import { AgendaReminderData } from '../notifications/notifications.model';
import { NotificationsService } from '../notifications/notifications.service';
import { UserTrophy } from '../trophies/trophies.dto';
import { UserAction } from '../actions/actions.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { UtilsService } from '../utils/utils.service';
import { TreatmentTimeline } from '@treatment-timeline/entities/treatment-timeline.entity';
import { StageType } from '@treatment-timeline/entities/stage.entity';
import { DefaultTimelineMessageData } from '@treatment-timeline/dto/treatment-timeline.dto';
import { Treatment } from '@treatments/entities/treatments.entity';
import { ShopitemPurchase, UserFriends, UserRoles } from '@users/users.dto';
import { OauthUser } from '@oauth/entities/oauth-users.entity';
import { SentMessageInfo } from 'nodemailer';
import { TreatmentsService } from '@treatments/treatments.service';
import { ActivationCode } from './dto/activation-code-translation.dto';
import { Language, Users } from '@users/users.model';
import { IntakeAppointmentTranslation } from './dto/intake-appointment-translation.dto';
import { ResearchAppointmentTranslation } from './dto/research-appointment-translation.dto';
import { OtherAppointmentTranslation } from './dto/other-appointment-translation.dto';
import { toolkitTimelineBaseDeepLinks } from './dto/toolkit-timeline-translation.dto';
import { Toolkit, ToolkitType } from '@toolkits/toolkits.model';
import { TreatementFileAttchmentTranslation } from './dto/treatment-file-attached-translation.dto';
import { OrderConfirmEmailTranslation } from './dto/order-confirm-email-translation.dto';
import { ConfirmEmailTranslation } from './dto/confirm-email-translation.dto';
import { ForgotPin } from './dto/forgot-pin-translation.dto';
import { TrophyTranslation } from './dto/trophy.translation.dto';
import { InActivityRefresherTranslation } from './dto/inactivity-refresher-translation.dto';
import { EnvVariable } from '@core/configs/config';
import { ConfigService } from '@nestjs/config';
import { AgendaReminderEmailTranslation } from './dto/agenda-reminder-email-translation.dto';
import { FormAddedEmailTranslation } from './dto/form-email-translation.dto';
import { BranchIOService } from '@shared/services/branch-io/branch-io.service';
import { ChannelPostDeletedByAdminTranslation } from './dto/channel-post-deleted-by-admin-translation.dto';
import { CloseTreatmentEmailTranslation } from './dto/close-treatment-email-translation.dto';
import { TreatmentBuddy } from '@treatments/entities/treatment-buddy.entity';
import { getISODate } from '@utils/util';
import { SendUserToolkitReminderEvent } from '@schedules/schedule.event';
import { OrderConfirmInvoiceTranslation } from './dto/order-confirm-invoice-translation.dto';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { GroupMemberDto } from './dto/group-member-added-translation.dto';
import { UserChannel } from '@channels/entities/user-channel.entity';
import { FriendFollowedTranslation } from './dto/friend-followed-translation.dto';
import { AddBuddyTreatment } from './dto/add-buddy-treatment-translation.dto';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private date: string;
  constructor(
    private readonly emailsContent: EmailsContent,
    private readonly templateService: TemplateService,
    private readonly sesService: EmailService,
    private readonly emailsQueue: EmailsQueue,
    private readonly emailsRepo: EmailsRepo,
    private readonly branchIoService: BranchIOService,
    private readonly notificationsService: NotificationsService,
    private readonly translationService: TranslationService,
    private readonly utilsService: UtilsService,
    private readonly treatmentsService: TreatmentsService,
    private readonly configService: ConfigService,
    private readonly firebaseDynamicLinksService: FirebaseDynamicLinksService,
  ) {}

  async sendForgotPassword(
    doctorId: string,
    link: string,
  ): Promise<SendEmailCommandOutput> {
    const user = await this.emailsRepo.getUserById(doctorId);
    const { email, first_name, full_name, language } = user;
    const name = first_name ? first_name : full_name?.split(' ')[0];
    const translationKeys = [
      'title',
      'hi',
      'p1',
      'p2',
      'p3',
      'subject',
      'have_fun',
      'team_superbrain',
      'button',
    ];
    const translations = {} as GetTranslationResponse;
    for (const key of translationKeys) {
      translations[key] = this.translationService.translate(
        `forgot-password.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.FORGOT_PASSWORD,
      {
        name,
        link,
        ...translations,
        ...layoutTranslation,
      },
    );

    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    this.logger.log(
      `${this.sendForgotPassword.name} success ${result.MessageId}`,
    );
    return result;
  }

  async sendForgetPin(
    user: Users,
    link: string,
  ): Promise<SendEmailCommandOutput> {
    const { language, email, first_name, full_name } = user;
    const translations = {} as GetTranslationResponse;
    for (const key of ForgotPin) {
      translations[key] = this.translationService.translate(
        `forgot_pin.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const name = first_name ? first_name : full_name?.split(' ')[0];
    const body = await this.templateService.getTemplate(Template.FORGOT_PIN, {
      link,
      name,
      ...translations,
      ...layoutTranslation,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    this.logger.log(
      `${this.sendForgotPassword.name} success ${result.MessageId}`,
    );
    return result;
  }

  async sendVerifyEmail(
    userId: string,
    link: string | undefined,
    code?: string,
  ): Promise<SendEmailCommandOutput> {
    const user = await this.emailsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { email, language, first_name, full_name } = user;
    const name = first_name ? first_name : full_name?.split(' ')[0];
    const translations = {} as GetTranslationResponse;
    for (const key of ConfirmEmailTranslation) {
      translations[key] = this.translationService.translate(
        `confirm-email.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.CONFRIM_EMAIL,
      {
        name,
        link,
        code,
        ...layoutTranslation,
        ...translations,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    this.logger.log(`${this.sendVerifyEmail.name} success ${result.MessageId}`);
    return result;
  }

  async sendVoucherEmail(
    email: string,
    name: string,
    voucherCode: string,
  ): Promise<SendEmailCommandOutput> {
    const body = await this.templateService.getTemplate(
      Template.VOUCHER_EMAIL,
      { name, voucherCode },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: `Your voucher is attached!`,
      body,
    });
    this.logger.log(
      `${this.sendVoucherEmail.name} success ${result.MessageId}`,
    );
    return result;
  }

  async addIntroductionVideoEmailJobs(email: string): Promise<void> {
    const start = DateTime.fromJSDate(new Date()).toUTC();
    const thirdDay = start.plus({ days: 3 });
    const seventhDay = start.plus({ days: 7 });
    const { milliseconds: threeDaysDelay } = thirdDay.diff(start).toObject();
    const { milliseconds: sevenDaysDelay } = seventhDay.diff(start).toObject();

    if (!threeDaysDelay || !sevenDaysDelay) {
      throw new BadRequestException('delay calculation failed');
    }
    Promise.all([
      this.emailsQueue.addActivationEmail({
        email: email,
        videoEmailType: VideoEmailType.ACTIVATION_EMAIL,
      }),
      this.emailsQueue.addIntroductionVideoDayThree(threeDaysDelay, {
        email: email,
        videoEmailType: VideoEmailType.INTRODUCTION_DAY_THREE,
      }),
      this.emailsQueue.addIntroductionVideoDaySeven(sevenDaysDelay, {
        email: email,
        videoEmailType: VideoEmailType.INTRODUCTION_DAY_SEVEN,
      }),
    ]);
  }

  async sendIntroductionVideoEmails(payload: VideoEmailData): Promise<string> {
    const { email, videoEmailType } = payload;
    const tableName = introductionVideoTableName.get(videoEmailType);
    const subject = introductionVideoEmailSubject.get(videoEmailType);
    if (!tableName) {
      throw new NotFoundException('table name not found');
    }
    const user = await this.emailsRepo.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { language } = user;
    const emailData = await this.emailsRepo.getIntroductionVideoEmailData(
      tableName,
      language,
    );

    if (!emailData || !subject) {
      throw new NotFoundException('email Data not found');
    }
    const { title, description, video_url, video_thumbnail_image_url } =
      emailData;
    const templateData = {
      subject: subject,
      title: title,
      description: description,
      videoLink: video_url,
      videoThumbnail: video_thumbnail_image_url,
    };
    const translations = {} as GetTranslationResponse;
    const IntroductionVideoTranslation = ['h1', 'button'];
    for (const key of IntroductionVideoTranslation) {
      translations[key] = this.translationService.translate(
        `introduction-video.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.INTRODUCTION_VIDEO_EMAIL,
      {
        ...templateData,
        ...layoutTranslation,
        ...translations,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: templateData.subject,
      body,
    });
    return `${this.sendIntroductionVideoEmails.name} success ${result.MessageId}`;
  }

  async sendInactivityRefresherEmail(userId: string): Promise<string> {
    const [user, toolkitsCount, channelsCount, toolkit] = await Promise.all([
      this.emailsRepo.getUserById(userId),
      this.emailsRepo.getToolkitsCount(),
      this.emailsRepo.getChannelsCount(),
      this.emailsRepo.getToolOfTheDay(),
    ]);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { email, user_name, first_name, language } = user;
    const { id: toolkitId, tool_kit_category, tool_kit_type } = toolkit;

    const [{ shortLink: communityLink }, { shortLink: toolkitLink }] =
      await Promise.all([
        this.firebaseDynamicLinksService.getAppUriSchemeWithPath(
          `/community_tab_selected/0`,
        ),
        this.firebaseDynamicLinksService.getAppUriSchemeWithPath(
          `/dashboard/toolkit_home_subroute_from_dashboard/toolkit_category_subroute_from_toolkit_category/${tool_kit_category}/tool_profile_subroute_from_toolkit_category/${toolkitId}/${tool_kit_type}`,
        ),
      ]);
    const translations = {} as GetTranslationResponse;
    for (const key of InActivityRefresherTranslation) {
      translations[key] = this.translationService.translate(
        `inactivity_refresher.${key}`,
        {},
        language,
      );
    }
    const name = first_name ? first_name : user_name?.split(' ')[0];
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.INACTIVITY_REFRESHER_EMAIL,
      {
        toolkitsCount,
        channelsCount,
        name,
        communityLink,
        toolkitLink,
        ...translations,
        ...layoutTranslation,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return `${this.sendInactivityRefresherEmail.name} success ${result.MessageId}`;
  }

  async sendAgendaReminderEmail(
    agendaReminderData: AgendaReminderData,
  ): Promise<string> {
    const { scheduleReminder, agenda } = agendaReminderData;
    const { user_id, reminder_time } = scheduleReminder;

    const user = await this.emailsRepo.getUserById(user_id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const userNotificationSettings =
      await this.emailsRepo.getUserNotificationSettings(user_id);

    if (!userNotificationSettings) {
      throw new NotFoundException('user notification settings not found');
    }

    const { allow_reminder_email_notification } = userNotificationSettings;

    if (!allow_reminder_email_notification) {
      return 'Reminder Email Notifications are Disabled';
    }

    const { email, language, user_name, first_name } = user;

    const page = await this.notificationsService.getAgendaReminderDeepLink(
      scheduleReminder,
      agenda,
    );

    if (!page) {
      throw new NotFoundException('deep link not found');
    }

    const newPage = page.slice(1);

    const { shortLink: toolkitLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(newPage);

    const translations = {} as GetTranslationResponse;

    for (const key of AgendaReminderEmailTranslation) {
      translations[key] = this.translationService.translate(
        `agenda-reminder-email.${key}`,
        {},
        language,
      );
    }

    const name = first_name ? first_name : user_name?.split(' ')[0];

    const layoutTranslation = await this.getLayoutTranslations(language);

    const body = await this.templateService.getTemplate(
      Template.AGENDA_REMINDER_EMAIL,
      {
        name,
        toolName: agenda.tool_description,
        reminder_time,
        toolkitLink,
        ...translations,
        ...layoutTranslation,
      },
    );

    await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });

    return `Agenda Reminder Email Sent Successfully`;
  }

  async sendVoucherCodeForShopItemPurchase(
    agendaReminderData: ShopitemPurchase,
  ): Promise<string> {
    const { user_id, voucher_code, shop_item_id } = agendaReminderData;
    const [shopItem, user] = await Promise.all([
      this.emailsRepo.getShopItemById(shop_item_id),
      this.emailsRepo.getUserById(user_id),
    ]);

    if (!shopItem || !user) {
      throw new NotFoundException(' shop item or user not found');
    }
    const { email, user_name } = user;
    const { title } = shopItem;

    const templateData = {
      username: user_name,
      shopItemTitle: title,
      voucherCode: voucher_code,
    };

    const bulkEntries: BulkEmailEntry[] = [
      {
        Destination: {
          ToAddresses: [email],
        },
        ReplacementEmailContent: {
          ReplacementTemplate: {
            ReplacementTemplateData: JSON.stringify(templateData),
          },
        },
      },
    ];
    const { failed, success } = await this.sesService.sendBulkEmails(
      bulkEntries,
      SesTemplates.SHOP_ITEM_PURCHASE,
    );
    return `Success: ${JSON.stringify(success)} Failed: ${JSON.stringify(
      failed,
    )}`;
  }

  private async getAchivedTrophyDetails(payload: UserTrophy): Promise<{
    username: string;
    email: string;
    trophyTitle: string;
    link: string;
    language: Language;
    first_name?: string;
  }> {
    const { id, user_id } = payload;
    const user = await this.emailsRepo.getUserById(user_id);
    if (!user) {
      throw new NotFoundException('User Not found');
    }
    const { user_name, email, language, first_name } = user;
    const trophy = await this.emailsRepo.getUserAchivedTrophy(id, language);
    if (!trophy) {
      throw new NotFoundException('User Achieved Trophy Not found');
    }
    const { image_url, title } = trophy;
    const data = {
      username: user_name,
      email: email,
      trophyTitle: title,
      link: image_url,
      language,
      first_name: first_name,
    };
    return data;
  }

  async sendTrophyAchivedEmail(achivedTrophy: UserTrophy): Promise<string> {
    const { email, username, trophyTitle, link, first_name, language } =
      await this.getAchivedTrophyDetails(achivedTrophy);
    const translations = {} as GetTranslationResponse;
    for (const key of TrophyTranslation) {
      translations[key] = this.translationService.translate(
        `trophy.${key}`,
        {},
        language,
      );
    }
    const name = first_name ? first_name : username?.split(' ')[0];
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(Template.TROPHY_WON, {
      username,
      trophyTitle,
      link,
      name,
      ...translations,
      ...layoutTranslation,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return `${this.sendTrophyAchivedEmail.name} success ${result.MessageId}`;
  }

  async renderTemplate(): Promise<string> {
    const template = this.templateService.getTemplate(Template.CONFRIM_EMAIL, {
      link: 'http://localhost',
      buttonName: 'hello',
    });
    return template;
  }

  async sendChannelPostDisabledByAdminEmail(userId: string): Promise<string> {
    const { email, user_name, language } = await this.emailsRepo.getUserById(
      userId,
    );

    const link = `/my_health_tab_selected/0/settings_subroute_from_me/${userId}/information_from_settings/community_rules_from_information?id&toolKitType=COMMUNITY_RULES`;

    const { shortLink: guidelinesLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(link);

    const translations = {} as GetTranslationResponse;
    for (const key of ChannelPostDeletedByAdminTranslation) {
      translations[key] = this.translationService.translate(
        `channel-post-deleted-by-admin.${key}`,
        {},
        language,
      );
    }

    const layoutTranslation = await this.getLayoutTranslations(language);

    const body = await this.templateService.getTemplate(
      Template.CHANNEL_POST_DELETED_BY_ADMIN,
      { user_name, guidelinesLink, ...layoutTranslation, ...translations },
    );

    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });

    this.logger.log(
      `${this.sendChannelPostDisabledByAdminEmail.name} success ${result.MessageId}`,
    );

    return 'Email Sent Successfully';
  }

  async sendActionClaimedVoucherCodeEmail(
    action: UserAction,
  ): Promise<SendEmailCommandOutput> {
    const { email, user_name } = await this.emailsRepo.getUserById(
      action.user_id,
    );
    if (!email) {
      throw new NotFoundException('Email Id not found');
    }
    const result = await this.sendVoucherEmail(
      email,
      user_name,
      action.voucher_code,
    );
    return result;
  }

  async sendDoctorVerificationEmail(
    email: string,
    name: string,
    link: string | undefined,
    code?: string,
  ): Promise<SendEmailCommandOutput> {
    const h1 = this.translationService.translate(`confirm-email.h1`);
    const h2 = this.translationService.translate(`confirm-email.h2`);
    const h3 = this.translationService.translate(`confirm-email.h3`);
    const p1 = this.translationService.translate(`confirm-email.p1`);
    const p2 = this.translationService.translate(`confirm-email.p2`);
    const a1 = this.translationService.translate(`confirm-email.a1`);
    const subject = this.translationService.translate(`confirm-email.subject`);
    const body = await this.templateService.getTemplate(
      Template.DOCTOR_CONFIRM_EMAIL,
      { name, link, code, h1, h2, h3, p1, p2, a1 },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: subject,
      body,
    });
    this.logger.log(
      `${this.sendDoctorVerificationEmail.name} success ${result.MessageId}`,
    );
    return result;
  }

  async sendDoctorForgetPin(
    email: string,
    name: string,
    code: string,
  ): Promise<SendEmailCommandOutput> {
    const hi = this.translationService.translate(`doctor-forgot-pin.hi`);
    const description = this.translationService.translate(
      `doctor-forgot-pin.description`,
    );
    const subject = this.translationService.translate(
      `doctor-forgot-pin.subject`,
    );
    const usingCode = this.translationService.translate(
      `doctor-forgot-pin.using_code`,
    );
    const buttonName = this.translationService.translate(
      `doctor-forgot-pin.buttonName`,
    );
    const forgotPin = this.translationService.translate(
      `doctor-forgot-pin.forgot_pin`,
    );
    const p1 = this.translationService.translate(`doctor-forgot-pin.you_can`);
    const h1 = this.translationService.translate(`doctor-forgot-pin.h1`);
    const h2 = this.translationService.translate(`doctor-forgot-pin.h2`);
    const body = await this.templateService.getTemplate(
      Template.DOCTOR_FORGOT_PIN,
      {
        name,
        code,
        hi,
        description,
        usingCode,
        buttonName,
        p1,
        forgotPin,
        h1,
        h2,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: subject,
      body,
    });
    this.logger.log(
      `${this.sendForgotPassword.name} success ${result.MessageId}`,
    );
    return result;
  }

  /**@deprecated Earlier we were doing this function in DoctorForgotPassword */
  async doctorSendForgotPassword(
    email: string,
    name: string,
    link: string,
  ): Promise<SendEmailCommandOutput> {
    const hi = this.translationService.translate(`doctor-forgot-password.hi`);
    const description = this.translationService.translate(
      `doctor-forgot-password.received_reset_password`,
    );
    const subject = this.translationService.translate(
      `doctor-forgot-password.subject_reset_password`,
    );
    const usinglink = this.translationService.translate(
      `doctor-forgot-password.using_link`,
    );
    const buttonName = this.translationService.translate(
      `doctor-forgot-password.reset_password`,
    );
    const p1 = this.translationService.translate(
      `doctor-forgot-password.you_can`,
    );
    const h1 = this.translationService.translate(`doctor-forgot-password.h1`);
    const h2 = this.translationService.translate(`doctor-forgot-password.h2`);
    const body = await this.templateService.getTemplate(
      Template.DOCTOR_FORGOT_PASSWORD,
      { name, link, hi, description, usinglink, buttonName, p1, h1, h2 },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: subject,
      body,
    });
    this.logger.log(
      `${this.doctorSendForgotPassword.name} success ${result.MessageId}`,
    );
    return result;
  }

  async sendPatientInvitationEmail(
    email: string,
    name: string,
    link: string,
  ): Promise<SendEmailCommandOutput> {
    const hi = this.translationService.translate(`paitent-invitation-email.hi`);
    const h2 = this.translationService.translate(`paitent-invitation-email.h2`);
    const button = this.translationService.translate(
      `paitent-invitation-email.button`,
    );
    const p1 = this.translationService.translate(`paitent-invitation-email.p1`);
    const body = await this.templateService.getTemplate(
      Template.PAITENT_INVITATION_EMAIL,
      {
        name,
        link,
        hi,
        h2,
        p1,
        button,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: this.translationService.translate(
        `paitent-invitation-email.subject`,
      ),
      body,
    });
    return result;
  }

  async sendChangeDoctorEmailRequest(
    email: string,
    name: string,
    link: string,
  ): Promise<SendEmailCommandOutput> {
    const h1 = this.translationService.translate(
      `send-change-doctor-email-request.h1`,
    );
    const h2 = this.translationService.translate(
      `send-change-doctor-email-request.h2`,
    );
    const hi = this.translationService.translate(
      `send-change-doctor-email-request.hi`,
    );
    const p1 = this.translationService.translate(
      `send-change-doctor-email-request.p1`,
    );
    const p2 = this.translationService.translate(
      `send-change-doctor-email-request.p2`,
    );
    const buttonName = this.translationService.translate(
      `send-change-doctor-email-request.buttonName`,
    );
    const body = await this.templateService.getTemplate(
      Template.DOCTOR_EMAIL_CHANGE_REQUEST,
      {
        name,
        link,
        hi,
        h1,
        h2,
        p1,
        p2,
        buttonName,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: this.translationService.translate(
        `send-change-doctor-email-request.subject`,
      ),
      body,
    });
    return result;
  }

  async sendSupportQuestionEmail(
    title: string,
    description: string,
    email: string,
  ): Promise<SendEmailCommandOutput> {
    const templateName = Template.SUPPORT_QUESTION;
    const body = await this.templateService.getTemplate(templateName, {
      title,
      description,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: 'Superbrains: Support Question Queries',
      body,
    });
    return result;
  }

  async sendUserOTPLoginEmail(
    userId: string,
    code: string,
  ): Promise<SendEmailCommandOutput> {
    const user = await this.emailsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const { email, first_name, full_name, language } = user;
    const name = first_name ? first_name : full_name?.split(' ')[0];
    const translationKeys = [
      'dear',
      'logged_in',
      'enter_code',
      'contact_team',
      'call_us',
      'subject',
      'have_fun',
      'superbrains_team',
      'title',
    ];
    const translations = {} as GetTranslationResponse;
    for (const key of translationKeys) {
      translations[key] = this.translationService.translate(
        `user_otp_login.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.USER_OTP_LOGIN,
      {
        name,
        code,
        ...translations,
        ...layoutTranslation,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendShopItemPurchaseEmail(
    shopitemPurchase: ShopitemPurchase,
  ): Promise<SentMessageInfo> {
    const {
      user_id,
      shop_item_id,
      user_address_id,
      item_price,
      created_at,
      payment_type,
      order_id,
      tax,
      tax_percentage,
      sub_total,
      grand_total,
      shipping_charges,
      item_quantity,
      hlp_reward_points_redeemd,
      item_size,
    } = shopitemPurchase;

    const [shopItem, user, userAddress] = await Promise.all([
      this.emailsRepo.getShopItemById(shop_item_id),
      this.emailsRepo.getUserById(user_id),
      this.emailsRepo.getUserAddressById(user_address_id),
    ]);

    if (!shopItem || !user || !userAddress) {
      return 'shop-item or user or user-address data not found';
    }

    const { email, language } = user;
    const { title, image_url } = shopItem;
    const {
      first_name,
      middle_name,
      last_name,
      postal_code,
      house_number,
      house_addition,
      street_address,
      hometown,
    } = userAddress;

    const orderId = this.utilsService.addPrefixInOrderId(order_id);

    let orderDate: DateTime | string = DateTime.fromJSDate(
      new Date(created_at as string),
    );
    const day = orderDate.day;
    const month = orderDate.monthLong;
    const year = orderDate.year;

    const translatedMonth = this.translationService.translate(
      `months.${month}`,
      {},
      language,
    );

    orderDate = `${day}-${translatedMonth}-${year}`;

    const emailTranslations = {} as GetTranslationResponse;
    const invoiceTranslations = {} as GetTranslationResponse;

    for (const key of OrderConfirmEmailTranslation) {
      emailTranslations[key] = this.translationService.translate(
        `order-confirm-email.${key}`,
        {},
        language,
      );
    }

    for (const key of OrderConfirmInvoiceTranslation) {
      invoiceTranslations[key] = this.translationService.translate(
        `order-confirm-invoice.${key}`,
        {},
        language,
      );
    }

    const layoutTranslation = await this.getLayoutTranslations(language);

    const shopItems = [
      {
        title,
        image_url,
        item_quantity,
        item_price,
        sub_total,
        qty: emailTranslations.qty,
        price: emailTranslations.price,
      },
    ];
    const commonData = {
      first_name,
      last_name,
      postal_code,
      house_number,
      house_addition,
      street_address,
      hometown,
      orderId,
      orderDate,
      sub_total,
      grand_total,
      hlp_reward_points_redeemd,
      tax,
      tax_percentage,
      shipping_charges,
    };
    const templateName = Template.ORDER_CONFIRMED_EMAIL;
    const attachmentTemplateName = AttachmentTemplate.ORDER_CONFIRMED_INVOICE;

    const [body, attachment] = await Promise.all([
      this.templateService.getTemplate(templateName, {
        payment_type,
        shopItems,
        middle_name,
        ...commonData,
        ...layoutTranslation,
        ...emailTranslations,
      }),
      this.templateService.getTemplate(attachmentTemplateName, {
        title,
        email,
        item_quantity,
        item_size,
        ...commonData,
        ...invoiceTranslations,
      }),
    ]);

    const attachmentPdf = await this.utilsService.convertHtmlToPdf(attachment);

    const payload: SendEmailAttachmentInput = {
      receiverEmail: email,
      subject: emailTranslations.subject,
      body,
      attachments: [
        {
          content: attachmentPdf,
          filename: 'invoice.pdf',
          contentType: 'application/pdf',
        },
      ],
    };

    const result = await this.sesService.sendEmailWithAttachments(payload);

    this.logger.log(
      `${this.sendShopItemPurchaseEmail.name} success ${result.messageId}`,
    );

    return result.response;
  }

  async sendIntakeAppointmentEmail(
    link: string,
    email: string,
    start_date: string | Date,
    language: Language,
    name?: string,
    coachName?: string,
  ): Promise<SendEmailCommandOutput> {
    const translations = {} as GetTranslationResponse;
    for (const key of IntakeAppointmentTranslation) {
      translations[key] = this.translationService.translate(
        `user_intake_appointment_schedule.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const templateName = Template.APPOINTMENT_EMAIL;
    const body = await this.templateService.getTemplate(templateName, {
      link,
      name,
      coachName,
      date: DateTime.fromJSDate(new Date(start_date)).toFormat(
        'dd LLLL yyyy HH:mm a',
      ),
      ...translations,
      ...layoutTranslation,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendResearchAppointmentEmail(
    link: string,
    email: string,
    start_date: string | Date,
    language: Language,
    name?: string,
    coachName?: string,
  ): Promise<SendEmailCommandOutput> {
    const translations = {} as GetTranslationResponse;
    for (const key of ResearchAppointmentTranslation) {
      translations[key] = this.translationService.translate(
        `user_research_appointment_schedule.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.RESEARCH_APPOINTMENT_EMAIL,
      {
        link,
        name,
        coachName,
        date: DateTime.fromJSDate(new Date(start_date)).toFormat(
          'dd LLLL yyyy HH:mm a',
        ),
        ...translations,
        ...layoutTranslation,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendOtherAppointmentEmail(
    link: string,
    email: string,
    start_date: string | Date,
    language: Language,
    name?: string,
    coachName?: string,
    user_appointment_title?: string,
  ): Promise<SendEmailCommandOutput | string> {
    if (!user_appointment_title) {
      return 'User appointment title not found';
    }
    const translations = {} as GetTranslationResponse;
    for (const key of OtherAppointmentTranslation) {
      translations[key] = this.translationService.translate(
        `user_other_appointment_schedule.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const translatedAppointmentTitle = this.translationService.translate(
      `appointment.type.${user_appointment_title}`,
      {},
      language,
    );
    const body = await this.templateService.getTemplate(
      Template.OTHER_APPOINTMENT_EMAIL,
      {
        link,
        name,
        coachName,
        date: DateTime.fromJSDate(new Date(start_date)).toFormat(
          'dd LLLL yyyy HH:mm a',
        ),
        user_appointment_title: translatedAppointmentTitle,
        ...translations,
        ...layoutTranslation,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendAppointmentAddedEmail(
    treatmentTimeline: TreatmentTimeline,
  ): Promise<string> {
    const { stage_type, user_id, schedule_id } = treatmentTimeline;
    if (!schedule_id) {
      return `Schedule not found in treatment timeline in ${treatmentTimeline.id}`;
    }
    const schedule = await this.emailsRepo.getScheduleById(schedule_id);
    if (!schedule) {
      return 'Schedule not found';
    }
    const { created_by, start_date, user_appointment_title } = schedule;
    if (!created_by) {
      return 'created_by not found';
    }
    const [user, coach] = await Promise.all([
      this.emailsRepo.getUserById(user_id),
      this.emailsRepo.getUserById(created_by),
    ]);
    if (!user) {
      return 'User not found';
    }
    if (!coach) {
      return 'User not found';
    }
    const date = new Date(start_date).toISOString();
    const { shortLink: deepLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(
        `/my_health_tab_selected/0/appointment_tab_subroute_from_timeline?from=plan&scheduleId=${schedule.id}&date=${date}&isCompleted=false`,
      );
    const { email, first_name, full_name, language } = user;
    const name = first_name ? first_name : full_name?.split(' ')[0];
    if (stage_type === StageType.INTAKE_APPOINTMENT) {
      await this.sendIntakeAppointmentEmail(
        deepLink,
        email,
        start_date,
        language,
        name,
        coach.first_name,
      );
      return 'Intake Appointment Email sent';
    } else if (stage_type === StageType.RESEARCH_APPOINTMENT) {
      await this.sendResearchAppointmentEmail(
        deepLink,
        email,
        start_date,
        language,
        name,
        coach.first_name,
      );
      return 'Research Appointment Email Sent';
    } else {
      await this.sendOtherAppointmentEmail(
        deepLink,
        email,
        start_date,
        language,
        name,
        coach.first_name,
        user_appointment_title,
      );
      return 'Other Appointment Email Sent';
    }

    return 'Appointment email not sent';
  }
  async prepareDeepLink(
    toolkit: Toolkit,
    schedule_id: string,
    sessionDate: string,
  ): Promise<string> {
    const basePage = toolkitTimelineBaseDeepLinks.get(
      toolkit.tool_kit_type as ToolkitType,
    );

    const page = basePage
      ? basePage
          .replace('replaceToolKitId', toolkit.id)
          .replace('replaceCategoryId', toolkit.tool_kit_category)
          .replace('replaceScheduleId', schedule_id)
          .replace('replaceGoalId', toolkit.goal_id)
          .replace('replaceTitle', toolkit.title)
          .replace('replaceSessionDate', sessionDate)
      : '';
    const { shortLink: link } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(page);
    return link;
  }
  async sendToolkitTimelineMessageAddedEmail(
    data: TreatmentTimeline,
  ): Promise<SendEmailCommandOutput | string> {
    const { user_id, schedule_id } = data;
    let sessionDate = getISODate(new Date(this.date));
    if (!schedule_id) {
      return 'Schedule not found';
    }
    const user = await this.emailsRepo.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }
    const { email, first_name, full_name, language } = user;
    const toolkit = await this.emailsRepo.getToolkitByScheduleId(
      language,
      schedule_id,
    );
    if (!toolkit) {
      return 'Toolkit not found';
    }
    const session = await this.emailsRepo.getSessionDateByScheduleId(
      schedule_id,
      user_id,
    );

    if (session) {
      sessionDate = getISODate(new Date(session.session_date));
    }

    const link = await this.prepareDeepLink(toolkit, schedule_id, sessionDate);

    const { title: translatedToolkitTitle } = toolkit;
    const translationKeys = [
      'hi',
      'p1',
      'p2',
      'p3',
      'p4',
      'subject',
      'have_fun',
      'superbrains_team',
      'title',
    ];
    const translations = {} as GetTranslationResponse;
    for (const key of translationKeys) {
      translations[key] = this.translationService.translate(
        `toolkit-timeline-message-email.${key}`,
        {},
        language,
      );
    }
    const name = first_name ? first_name : full_name?.split(' ')[0];
    const layoutTranslation = await this.getLayoutTranslations(language);
    const templateName = Template.TOOLKIT_TIMELINE_MESSAGE_EMAIL;
    const body = await this.templateService.getTemplate(templateName, {
      haveFun: translations.have_fun,
      superbrainsTeam: translations.superbrains_team,
      ...translations,
      name,
      link,
      translatedToolkitTitle,
      ...layoutTranslation,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendFormAddedEmail(
    treatmentTimeline: TreatmentTimeline,
  ): Promise<SendEmailCommandOutput | string> {
    const { user_id, schedule_id } = treatmentTimeline;
    let sessionDate = getISODate(new Date(this.date));
    const user = await this.emailsRepo.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }

    if (!schedule_id) {
      return 'User not found';
    }

    const { email, first_name, full_name, language } = user;
    const name = first_name ? first_name : full_name?.split(' ')[0];
    const toolkit = await this.emailsRepo.getToolkitByScheduleId(
      language,
      schedule_id as string,
    );
    if (!toolkit) {
      return 'Toolkit not found';
    }
    const { title: translatedToolkitTitle } = toolkit;
    const session = await this.emailsRepo.getSessionDateByScheduleId(
      schedule_id,
      user_id,
    );

    if (session) {
      sessionDate = getISODate(new Date(session.session_date));
    }

    const link = await this.prepareDeepLink(toolkit, schedule_id, sessionDate);

    const translations = {} as GetTranslationResponse;
    for (const key of FormAddedEmailTranslation) {
      translations[key] = this.translationService.translate(
        `forms-timeline-message-email.${key}`,
        {},
        language,
      );
    }

    const layoutTranslation = await this.getLayoutTranslations(language);
    const templateName = Template.FORM_EMAIL;

    const body = await this.templateService.getTemplate(templateName, {
      name,
      link,
      translatedToolkitTitle,
      ...translations,
      ...layoutTranslation,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendDefaultTimelineMessageAddedEmail(
    data: DefaultTimelineMessageData,
  ): Promise<SendEmailCommandOutput | string> {
    const { userId, stageMessageId, scheduleId } = data;
    let sessionDate = getISODate(new Date(this.date));
    if (!stageMessageId) {
      return 'Satge Message Not Found';
    }
    if (!scheduleId) {
      return 'Schedule Not Found';
    }
    const user = await this.emailsRepo.getUserById(userId);
    const { email, first_name, full_name, language } = user;
    const name = first_name ? first_name : full_name?.split('')[0];
    const stageMessage = await this.emailsRepo.getStageMessageById(
      stageMessageId,
      language,
    );
    if (!stageMessage) {
      return 'Stage Message not found';
    }
    if (!user) {
      return 'users.user_not_found';
    }
    const toolkit = await this.emailsRepo.getToolkitByScheduleId(
      language,
      scheduleId,
    );
    if (!toolkit) {
      return 'Toolkit not found';
    }

    const session = await this.emailsRepo.getSessionDateByScheduleId(
      scheduleId,
      userId,
    );

    if (session) {
      sessionDate = getISODate(new Date(session.session_date));
    }

    const link = await this.prepareDeepLink(toolkit, scheduleId, sessionDate);

    const translationKeys = [
      'hi',
      'p1',
      'p2',
      'p3',
      'p4',
      'subject',
      'title',
      'have_fun',
      'superbrains_team',
    ];
    const translations = {} as GetTranslationResponse;
    for (const key of translationKeys) {
      translations[key] = this.translationService.translate(
        `default-timeline-message-email.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const templateName = Template.DEFAULT_TIMELINE_MESSAGE_EMAIL;
    const body = await this.templateService.getTemplate(templateName, {
      name,
      link,
      translatedTreatmentMessage: stageMessage.translations,
      haveFun: translations.have_fun,
      superbrainsTeam: translations.superbrains_team,
      ...translations,
      ...layoutTranslation,
    });
    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendTreatmentClosedEmail(
    treatment: Treatment,
  ): Promise<SendEmailCommandOutput | string> {
    const { id } = treatment;
    const treatmentWithTreatmentUsers =
      await this.emailsRepo.getTreatmentWithTreatmentUsers(id);

    if (!treatmentWithTreatmentUsers) {
      return 'Treatment not found';
    }

    let result: SendEmailCommandOutput | string = '';

    treatmentWithTreatmentUsers.forEach(async (treatmentWithTreatmentUser) => {
      const { first_name, full_name, language, email } =
        treatmentWithTreatmentUser;
      const name = first_name ? first_name : full_name?.split('')[0];
      const translations = {} as GetTranslationResponse;
      for (const key of CloseTreatmentEmailTranslation) {
        translations[key] = this.translationService.translate(
          `close_treatment_email.${key}`,
          {},
          language,
        );
      }
      const subject =
        treatmentWithTreatmentUser.role === UserRoles.USER
          ? translations.patient_subject
          : translations.coach_subject;

      const p1 =
        treatmentWithTreatmentUser.role === UserRoles.USER
          ? translations.patient_p1
          : translations.coach_p1;

      const have_fun =
        treatmentWithTreatmentUser.role === UserRoles.USER
          ? translations.greetings
          : translations.coach_have_fun;
      const { fileName, readableStream, treatmentUserName } =
        await this.treatmentsService.getReadableStreamTreatmentFile(
          id,
          language,
          true,
        );
      const patientName =
        treatmentWithTreatmentUser.role === UserRoles.DOCTOR
          ? treatmentUserName
          : '';

      const attachment = await this.utilsService.streamToBuffer(readableStream);

      const layoutTranslation = await this.getLayoutTranslations(language);

      const body = await this.templateService.getTemplate(
        Template.CLOSE_TREATMENT_EMAIL,
        {
          name,
          p1,
          have_fun,
          treatmentUser: patientName,
          ...translations,
          ...layoutTranslation,
        },
      );

      const payload: SendEmailAttachmentInput = {
        receiverEmail: email,
        subject: subject,
        body: body,
        attachments: [
          {
            content: attachment,
            filename: fileName,
            contentType: 'text/plain',
          },
        ],
      };

      result = await this.sesService.sendEmailWithAttachments(payload);
    });

    return result;
  }

  async sendAfterCareEmailToTreatmentOwner(
    treatment: Treatment,
  ): Promise<SendEmailCommandOutput | string> {
    const { id: treatmentId } = treatment;
    const treatmentOwner = await this.emailsRepo.getTreatmentOwnerByTreatmentId(
      treatmentId,
    );

    if (!treatmentOwner) {
      return 'Treatment Owner not found';
    }

    const { email, treatment_name, first_name, last_name } = treatmentOwner;
    const name = `${first_name} ${last_name}`;
    const hi = this.translationService.translate(`after_care_email.hi`);
    const title = this.translationService.translate(`after_care_email.title`);
    const description = this.translationService.translate(
      `after_care_email.body`,
    );
    const h1 = this.translationService.translate(`after_care_email.h1`);

    const templateName = Template.AFTER_CARE_TREATMENT_EMAIL;

    const body = await this.templateService.getTemplate(templateName, {
      hi,
      title,
      description,
      treatmentName: treatment_name,
      name,
      h1,
    });

    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: this.translationService.translate(`after_care_email.subject`),
      body,
    });
    return result;
  }

  async getLayoutTranslations(
    language: string,
  ): Promise<GetLayoutTranslationResponse> {
    const translationKeys = [
      'supportDescription',
      'footer_text',
      'privacy',
      'account',
      'unsubscribe',
    ];
    const translations = {} as GetLayoutTranslationResponse;
    for (const key of translationKeys) {
      translations[key] = this.translationService.translate(
        `layout.${key}`,
        {},
        language,
      );
    }
    return translations;
  }

  async sendUserActivationCodeEmail(
    oauthUserData: OauthUser,
  ): Promise<SendEmailCommandOutput | string> {
    const language = 'nl';
    const oauthUser = await this.emailsRepo.getOauthUserById(oauthUserData.id);

    if (!oauthUser) {
      return 'Oauth User Not found';
    }
    const { email, activation_code: code, display_name } = oauthUser;
    const translations = {} as GetTranslationResponse;
    for (const key of ActivationCode) {
      translations[key] = this.translationService.translate(
        `oauth_user_email.${key}`,
        {},
        language,
      );
    }
    const downloadAppUrl = this.configService.getOrThrow<string>(
      EnvVariable.DOWNLOAD_APP_URL,
    );
    const name = display_name ? display_name.split(',')[0] : translations.user;
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.USER_ACTIVATION_CODE_EMAIL,
      {
        code,
        name,
        downloadAppUrl,
        codeDescription: translations.code_description,
        ...translations,
        ...layoutTranslation,
      },
    );

    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendBuddyTreatmentEmail(
    buddyTreatmentData: TreatmentBuddy,
  ): Promise<SendEmailCommandOutput | string> {
    const { user_id, created_by, treatment_id } = buddyTreatmentData;
    const [user, createdBy, treatment] = await Promise.all([
      this.emailsRepo.getUserById(user_id),
      this.emailsRepo.getUserById(created_by),
      this.emailsRepo.getTreatmentById(treatment_id),
    ]);

    if (!user || !createdBy) {
      return 'User Not found';
    }
    if (!treatment) {
      return 'Treatment Not found';
    }
    const treatmentUser = await this.emailsRepo.getUserById(treatment.user_id);
    if (!treatmentUser) {
      return 'Treatment User Not found';
    }
    const treatmentUserName = treatmentUser.first_name
      ? `${treatmentUser.first_name} ${treatmentUser.last_name}`
      : treatmentUser.user_name;
    const { email, first_name, user_name, language } = user;
    const {
      first_name: firstName,
      last_name: lastName,
      user_name: userName,
      role,
    } = createdBy;
    const translations = {} as GetTranslationResponse;
    const name = first_name ? first_name : user_name;
    const existingCoachOrPatientName =
      role === UserRoles.DOCTOR ? `${firstName} ${lastName}` : userName;
    for (const key of AddBuddyTreatment) {
      translations[key] = this.translationService.translate(
        `buddies-treatment-email.${key}`,
        {},
        language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.TREATMENT_TEAM_BUDDY_ADDED_EMAIL,
      {
        name,
        language: user.language === Language.en ? translations.p3 : '.',
        patientOrCoachName: Language.en
          ? treatmentUserName
          : existingCoachOrPatientName,
        coachOrPatientName: Language.en
          ? existingCoachOrPatientName
          : treatmentUserName,
        ...translations,
        ...layoutTranslation,
      },
    );

    const result = await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendTreatementFileAttachedEmail(
    treatmentId: string,
    userId: string,
  ): Promise<SentMessageInfo> {
    const user = await this.emailsRepo.getUserById(userId);
    if (!user) {
      return 'User Not Found';
    }
    const { language } = user;
    const { fileName, readableStream, treatmentUserName } =
      await this.treatmentsService.getReadableStreamTreatmentFile(
        treatmentId,
        language,
      );
    const attachment = await this.utilsService.streamToBuffer(readableStream);
    const translations = {} as GetTranslationResponse;
    for (const key of TreatementFileAttchmentTranslation) {
      translations[key] = this.translationService.translate(
        `treatment_file_attached_email.${key}`,
        {},
        language,
      );
    }
    const { email, first_name, full_name, user_name, role } = user;
    const name =
      role === UserRoles.USER
        ? first_name || user_name
        : first_name || full_name;
    TreatementFileAttchmentTranslation;
    const layoutTranslation = await this.getLayoutTranslations(language);
    const body = await this.templateService.getTemplate(
      Template.TREATMENT_FILE_ATTACHED_EMAIL,
      {
        name,
        treatmentUserName,
        ...layoutTranslation,
        ...translations,
      },
    );
    const payload: SendEmailAttachmentInput = {
      receiverEmail: email,
      subject: translations.subject,
      body: body,
      attachments: [
        {
          content: attachment,
          filename: fileName,
          contentType: 'text/plain',
        },
      ],
    };
    const result = await this.sesService.sendEmailWithAttachments(payload);
    this.logger.log(
      `${this.sendTreatementFileAttachedEmail.name} success ${result.messageId}`,
    );
    return result.response;
  }

  async sendUserToolkitReminderEmail(
    payload: SendUserToolkitReminderEvent,
  ): Promise<string> {
    const { scheduleReminder, userTookit } = payload;
    const { user_id, reminder_time } = scheduleReminder;

    const [user, userNotificationSettings] = await Promise.all([
      this.emailsRepo.getUserById(user_id),
      this.emailsRepo.getUserNotificationSettings(user_id),
    ]);

    if (!user) {
      return 'user not found';
    }

    if (!userNotificationSettings) {
      return 'user notification settings not found';
    }

    const { allow_reminder_email_notification } = userNotificationSettings;

    if (!allow_reminder_email_notification) {
      return 'Reminder Email Notifications are Disabled';
    }

    const { email, language, user_name, first_name } = user;
    // TODO: Need to update the DeepLink
    const page = `/dashboard`;

    if (!page) {
      throw new NotFoundException('deep link not found');
    }

    const { shortLink: toolkitLink } =
      await this.firebaseDynamicLinksService.createfirebaseDynamicLinks(page);

    const translations = {} as GetTranslationResponse;

    for (const key of AgendaReminderEmailTranslation) {
      translations[key] = this.translationService.translate(
        `agenda-reminder-email.${key}`,
        {},
        language,
      );
    }

    const name = first_name ? first_name : user_name?.split(' ')[0];

    const layoutTranslation = await this.getLayoutTranslations(language);

    const body = await this.templateService.getTemplate(
      Template.AGENDA_REMINDER_EMAIL,
      {
        name,
        toolName: userTookit.title,
        reminder_time,
        toolkitLink,
        ...translations,
        ...layoutTranslation,
      },
    );

    await this.sesService.sendEmail({
      receiverEmail: [email],
      subject: translations.subject,
      body,
    });

    return `Agenda Reminder Email Sent Successfully`;
  }

  async sendGroupMemberAddedEmail(
    payload: UserChannel,
  ): Promise<SendEmailCommandOutput | string> {
    const { user_id, channel_id, created_by: doctor_id } = payload;
    if (!doctor_id) {
      return `Invalid doctor`;
    }
    const [user, group, doctor] = await Promise.all([
      this.emailsRepo.getUserById(user_id),
      this.emailsRepo.getGroupById(channel_id),
      this.emailsRepo.getUserById(doctor_id),
    ]);
    if (!user) {
      return `Invalid user`;
    }
    if (!group) {
      return `Invalid group`;
    }
    const { first_name: userFirstName, full_name: userFullName } = user;
    const name = userFirstName ? userFirstName : userFullName?.split(' ')[0];
    const { first_name: doctorFirstName, full_name: doctorFullName } = doctor;
    const coachName = doctorFirstName
      ? doctorFirstName
      : doctorFullName?.split(' ')[0];
    const { title: groupName } = group;
    const translations = {} as GetTranslationResponse;
    for (const key of GroupMemberDto) {
      translations[key] = this.translationService.translate(
        `group_member_added_email.${key}`,
        {},
        user.language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(user.language);

    const body = await this.templateService.getTemplate(
      Template.GROUP_MEMBER_ADDED_EMAIL,
      {
        name,
        coachName,
        groupName,
        ...translations,
        ...layoutTranslation,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [user.email],
      subject: translations.subject,
      body,
    });
    return result;
  }

  async sendFriendFollowedEmail(
    payload: UserFriends,
  ): Promise<SendEmailCommandOutput | string> {
    const { user_id, friend_id } = payload;
    const [user, friend] = await Promise.all([
      this.emailsRepo.getUserById(user_id),
      this.emailsRepo.getUserById(friend_id),
    ]);
    if (!user) {
      return `User not found`;
    }
    if (!friend) {
      return `Friend not found`;
    }
    const { first_name: userFirstName, user_name: userName } = user;
    const name = userFirstName ? userFirstName : userName;
    const translations = {} as GetTranslationResponse;
    for (const key of FriendFollowedTranslation) {
      translations[key] = this.translationService.translate(
        `friend_followed.${key}`,
        {},
        user.language,
      );
    }
    const layoutTranslation = await this.getLayoutTranslations(user.language);

    const body = await this.templateService.getTemplate(
      Template.FRIEND_FOLLOWED_EMAIL,
      {
        name,
        screenName: friend.full_name,
        ...translations,
        ...layoutTranslation,
      },
    );
    const result = await this.sesService.sendEmail({
      receiverEmail: [user.email],
      subject: translations.subject,
      body,
    });
    return result;
  }
}
