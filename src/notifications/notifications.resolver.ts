import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { NotificationsService } from './notifications.service';
import { UserNotificationSettings, UserRoles } from '../users/users.dto';
import {
  UserNotificationArgs,
  UserNotificationSettingArgs,
  UserNotificationSettingInput,
} from './dto/notifications.dto';
import { UserNotification } from './entities/user-notifications.entity';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetUserNotificationResponse } from './dto/get-notifications.dto';
import {
  DoctorNotificationArgs,
  GetDoctorNotificationResponse,
} from './dto/get-doctor-notifications.dto';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => UserNotificationSettings, {
    name: 'getUserNotificationSettings',
  })
  async getUserNotificationSettings(
    @GetUser() user: LoggedInUser,
  ): Promise<UserNotificationSettings> {
    return this.notificationsService.getUserNotificationSetting(user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserNotificationSettings, {
    name: 'updateUserNotificationSettings',
  })
  async updateUserNotificationSettings(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UserNotificationSettingInput,
    @Args() args: UserNotificationSettingArgs,
  ): Promise<UserNotificationSettings> {
    return this.notificationsService.updateUserNotificationSettings(
      user.id,
      input,
      args.userNotificationSettingId,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => UserNotification, {
    name: 'readNotification',
  })
  async readNotification(
    @GetUser() user: LoggedInUser,
    @Args() args: UserNotificationArgs,
  ): Promise<UserNotification> {
    return this.notificationsService.readNotification(
      user.id,
      args.userNotificationId,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [UserNotification], {
    name: 'readAllNotifications',
  })
  async clearAllNotifications(
    @GetUser() user: LoggedInUser,
  ): Promise<UserNotification[]> {
    return this.notificationsService.readAllNotifications(user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserNotificationResponse, {
    name: 'getUserNotifications',
  })
  async getUserNotifications(
    @GetUser() user: LoggedInUser,
    @Args() args: PaginationArgs,
  ): Promise<GetUserNotificationResponse> {
    return this.notificationsService.getUserNotifications(user.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorNotificationResponse, {
    name: 'getDoctorNotifications',
  })
  async getDoctorNotifications(
    @GetUser() doctor: LoggedInUser,
    @Args() args: DoctorNotificationArgs,
  ): Promise<GetDoctorNotificationResponse> {
    return this.notificationsService.getDoctorNotifications(doctor.id, args);
  }
}
