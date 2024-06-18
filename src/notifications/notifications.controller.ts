import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../shared/guards/roles.guard';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { UserRoles } from '../users/users.dto';
import { NotificationsService } from './notifications.service';
import { Roles } from '../shared/decorators/roles.decorator';
import { OneSignalService } from '@shared/services/one-signal/one-signal';
import {
  GenerateAuthHash,
  GetAndroidNotificationChannel,
} from './notifications.model';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly oneSignalService: OneSignalService,
  ) {}

  @Post('/add-engagement')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addEngagementNotifications(
    @Body() body: { cron: string },
  ): Promise<{ response: string }> {
    return this.notificationsService.addEngagementNotification(body.cron);
  }

  @Post('/remove-engagement')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeEngagementNotifications(): Promise<{ response: string }> {
    return this.notificationsService.removeEngagementNotification();
  }

  @Post('/add-inactivity')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addInactivityNotifications(
    @Body() body: { cron: string },
  ): Promise<{ response: string }> {
    return this.notificationsService.addInactivityNotification(body.cron);
  }

  @Post('/remove-inactivity')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeInactivityNotifications(): Promise<{ response: string }> {
    return this.notificationsService.removeInactivityNotification();
  }

  @Post('/generate-hash')
  async generateAuthHash(@Body() body: GenerateAuthHash): Promise<string> {
    return this.oneSignalService.generateAuthHash(body.data);
  }

  @Post('/android-channel')
  async getAndroidChannel(
    @Body() body: GetAndroidNotificationChannel,
  ): Promise<string> {
    return this.notificationsService.getAndroidChannel(body);
  }

  @Post('/send-test-notification')
  async sendTestNotification(
    @Body() body: { id: string },
  ): Promise<{ response: string }> {
    return this.notificationsService.sendTestNotification(body.id);
  }
}
