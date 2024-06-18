import {
  CreateEmailTemplateCommandOutput,
  CreateEmailTemplateRequest,
  DeleteEmailTemplateCommandInput,
  DeleteEmailTemplateCommandOutput,
} from '@aws-sdk/client-sesv2';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { EmailService } from '@shared/services/email/email.service';
import { UserTrophy } from '../trophies/trophies.dto';
import { AgendaReminderData } from '../notifications/notifications.model';
import { ShopitemPurchaseData, UserRoles } from '../users/users.dto';
import { EmailsService } from './emails.service';
import { Public } from '../shared/decorators/public.decorator';

@Controller('/emails')
export class emailsController {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly sesService: EmailService,
  ) {}

  @Post('/test/add-video-jobs')
  async testVideoEmail(@Body() body: { email: string }): Promise<void> {
    return this.emailsService.addIntroductionVideoEmailJobs(body.email);
  }

  @Post('/test/inactivity-email')
  async testInactivityEmail(@Body() body: { userId: string }): Promise<string> {
    return this.emailsService.sendInactivityRefresherEmail(body.userId);
  }

  @Post('/test/agenda-reminder')
  async testAgendaReminderEmail(
    @Body() body: AgendaReminderData,
  ): Promise<string> {
    return this.emailsService.sendAgendaReminderEmail(body);
  }

  @Post('/test/trophy-achieved')
  async testTrophyAchivedEmail(@Body() body: UserTrophy): Promise<string> {
    return this.emailsService.sendTrophyAchivedEmail(body);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create-template')
  async createEmailTemplate(
    @Body() body: CreateEmailTemplateRequest,
  ): Promise<CreateEmailTemplateCommandOutput> {
    return this.sesService.createEmailTemplate(body);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('/update-template')
  async updateEmailTemplate(
    @Body() body: CreateEmailTemplateRequest,
  ): Promise<CreateEmailTemplateCommandOutput> {
    return this.sesService.updateEmailTemplate(body);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete-template')
  async deleteEmailTemplate(
    @Body() body: DeleteEmailTemplateCommandInput,
  ): Promise<DeleteEmailTemplateCommandOutput> {
    return this.sesService.deleteEmailTemplate(body);
  }

  @Get('/render')
  @Public()
  async renderTemplate(): Promise<string> {
    return this.emailsService.renderTemplate();
  }

  @Post('/test/channel-post-disabled-by-admin')
  async testChannelPostDeletedByAdmin(
    @Body() body: { userId: string },
  ): Promise<string> {
    return this.emailsService.sendChannelPostDisabledByAdminEmail(body.userId);
  }

  @Post('/attachment/test-email')
  async sendMailAttachment(
    @Body() body: ShopitemPurchaseData,
  ): Promise<string> {
    return this.emailsService.sendShopItemPurchaseEmail(body.shopitemPurchase);
  }
}
