import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { CheckinsService } from './checkins.service';
import {
  GetCheckinLogsArgs,
  GetCheckinLogsArgsNew,
  GetCheckinLogsReponse,
  GetCheckinLogsReponseNew,
} from './dto/checkin-logs.dto';
import {
  GetCheckinsHistoryResponse,
  GetCheckInsListWithUserCheckInStatusRes,
} from './dto/checkins-history.dto';
import { CheckInInfo } from './entities/check-in-info.entity';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { GetUserCheckinsHistoryArgs } from './dto/get-user-checkins-history.dto';

@Resolver()
export class CheckinsResolver {
  constructor(private readonly checkinsServive: CheckinsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetCheckinLogsReponse, { name: 'getCheckinLogs' })
  async getCheckinsLogs(
    @GetUser() user: LoggedInUser,
    @Args() args: GetCheckinLogsArgs,
  ): Promise<GetCheckinLogsReponse> {
    return this.checkinsServive.getCheckinLogs(user.id, args.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetCheckinsHistoryResponse, { name: 'getCheckinsHistory' })
  async getCheckinsHistory(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetCheckinsHistoryResponse> {
    return this.checkinsServive.getCheckinsHistory(user.id, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetCheckinLogsReponseNew, { name: 'getCheckinMyLogs' })
  async getCheckinsLogsNew(
    @GetUser() user: LoggedInUser,
    @Args() args: GetCheckinLogsArgsNew,
  ): Promise<GetCheckinLogsReponseNew> {
    return this.checkinsServive.getCheckinsLogsNew(user.id, args.date);
  }
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => CheckInInfo, { name: 'getCheckInInfo' })
  async getCheckInInfo(@I18nNextLanguage() lang: string): Promise<CheckInInfo> {
    return this.checkinsServive.getCheckInInfo(lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [GetCheckInsListWithUserCheckInStatusRes], {
    name: 'getCheckInsListWithUserCheckInStatus',
  })
  async getCheckInsListWithUserCheckInStatus(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetCheckInsListWithUserCheckInStatusRes[]> {
    return this.checkinsServive.getCheckInsListWithUserCheckInStatus(
      user.id,
      lang,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetCheckinsHistoryResponse, { name: 'getUserCheckinsHistory' })
  async getUserCheckinsHistory(
    @Args() args: GetUserCheckinsHistoryArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetCheckinsHistoryResponse> {
    return this.checkinsServive.getCheckinsHistory(args.userId, lang);
  }
}
