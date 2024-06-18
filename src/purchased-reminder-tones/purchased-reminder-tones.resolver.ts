import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetReminderTonesListResponse,
  GetReminderTonesResponseDto,
} from './dto/get-reminder-tones.dto';
import { PurchasedReminderTonesService } from './purchased-reminder-tones.service';
import { CommonResponseMessage } from '../users/users.model';
import { PurchasedReminderToneArgs } from './dto/purchased-reminder-tone.dto';

@Resolver()
export class PurchasedReminderTonesResolver {
  constructor(
    private readonly reminderTonesService: PurchasedReminderTonesService,
  ) {}

  @Query(() => GetReminderTonesResponseDto, {
    name: 'GetPurchasedReminderTones',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTones(
    @GetUser() user: LoggedInUser,
  ): Promise<GetReminderTonesResponseDto> {
    return this.reminderTonesService.getReminderTones(user.id);
  }

  @Query(() => GetReminderTonesListResponse, {
    name: 'getReminderTonesList',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getReminderTonesList(
    @GetUser() user: LoggedInUser,
  ): Promise<GetReminderTonesListResponse> {
    return this.reminderTonesService.getReminderTonesList(user.id);
  }

  @Mutation(() => CommonResponseMessage, {
    name: 'purchaseReminderTone',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async purchaseReminderTone(
    @GetUser() user: LoggedInUser,
    @Args() args: PurchasedReminderToneArgs,
  ): Promise<CommonResponseMessage> {
    return this.reminderTonesService.purchaseReminderTone(
      user.id,
      args.reminderToneId,
    );
  }
}
