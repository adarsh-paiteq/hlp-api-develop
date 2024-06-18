import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from '../shared/decorators/public.decorator';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import {
  AddPinDto,
  AddPinParamsDto,
  AdminSignupDto,
  BuyReminderToneDTO,
  CampaignListModel,
  ChallengesRankingQueryDTO,
  ChangePasswordDto,
  ChangePasswordParamsDto,
  ChangePasswordQueryDto,
  ChangePINDto,
  ChangePINParamsDto,
  ChangePINQueryDto,
  CheckEmailDto,
  CheckPinDto,
  CheckPinParamsDto,
  CommonResponseMessage,
  DynamicLinkDto,
  ForgotPINDto,
  GetHabitToolEndDateResponse,
  GetUserScoreParamDto,
  GetUserScoreResponseDto,
  HabitToolEndDateDTO,
  LoginDto,
  RefreshTokenDto,
  SendVerificationEmailDto,
  SendVerificationEmailParamsDto,
  ShopItemPriceAndHLPPointsDTO,
  ShopItemPriceAndHLPPointsResponse,
  ToolKitAnswerHistoryDTO,
  ToolKitByUserGoalsAndToolKitCategoryDTO,
  ToolKitByUserGoalsAndToolKitCategoryResponse,
  ToolKitHistoryDTO,
  User,
  UserHasJoinedChallengeDTO,
  UserRoles,
  UserScheduleDTO,
  UserSignupDto,
  VerifyEmailParamsDto,
  VerifyEmailQueryDto,
} from './users.dto';
import { UsersService } from './users.service';
import {
  EmailService,
  SendEmailInput,
} from '../shared/services/email/email.service';
import { SendEmailCommandOutput } from '@aws-sdk/client-sesv2';

import {
  AdminSignupResponse,
  CheckPinResponse,
  RefreshTokenResponse,
  UserSignupResponse,
} from './users.model';
import {
  GetExtraInformationArgs,
  GetExtraInformationResponse,
} from './dto/get-extra-information.dto';
import { AdminAuthGuard } from '@shared/guards/admin-auth.guard';
import { LoginResponse } from './dto/login-user-account.dto';
import { UserIdBody } from './dto/users.dto';
import { AddOrUpdateUserToMailchimpListResponse } from '@shared/services/mailchimp/dto/mailchimp.dto';
import { BranchIOService } from '@shared/services/branch-io/branch-io.service';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly branchIoService: BranchIOService,
    private readonly emailService: EmailService,
    private readonly firebaseDynamicLinksService: FirebaseDynamicLinksService,
  ) {}

  /**
   *@deprecated its's migrated to loginAccount
   */
  @Post('/login')
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    return this.usersService.login(body);
  }

  /**
   *@deprecated its's migrated to userSignup
   */
  @Post('/signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signup(@Body() body: UserSignupDto): Promise<UserSignupResponse> {
    return this.usersService.userSignup(body);
  }

  /**
   *@description its's migrated to adminSignup  for  internal use.
   */
  @Post('/admin/signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AdminAuthGuard)
  async adminSignup(
    @Body() body: AdminSignupDto,
  ): Promise<AdminSignupResponse> {
    return this.usersService.adminSignup(body);
  }

  /**
   * @deprecated its's migrated to refreshToken
   */
  @Post('/refreshToken')
  async getToken(@Body() body: RefreshTokenDto): Promise<RefreshTokenResponse> {
    return this.usersService.refreshToken(body.token);
  }

  /**
   * @deprecated its's migrated to forgotPassword
   */
  @Post('/forgotPassword')
  async forgotPassword(
    @Body() body: SendVerificationEmailDto,
  ): Promise<CommonResponseMessage> {
    return this.usersService.forgotPassword(body.email);
  }

  /**
   * @deprecated its's migrated to sendForgotPinEmail
   */
  @Post('/forgotPin')
  async sendForgotPINEmail(
    @Body() body: ForgotPINDto,
  ): Promise<CommonResponseMessage> {
    return this.usersService.sendForgotPinEmail(body.email);
  }

  /**
   * @decription its's migrated to checkEmail but app side not used
   */
  @Post('/checkEmail')
  async checkEmail(@Body() body: CheckEmailDto): Promise<{ exist: boolean }> {
    const { isExists } = await this.usersService.checkEmail(body);
    return { exist: isExists };
  }

  /**
   * @deprecated its's migrated to changePassword
   */
  @Patch('/:id/password')
  @Public()
  async changePassword(
    @Param() params: ChangePasswordParamsDto,
    @Body() body: ChangePasswordDto,
    @Query() query: ChangePasswordQueryDto,
  ): Promise<CommonResponseMessage> {
    const args = {
      id: params.id,
      password: body.password,
      token: query.token,
    };
    return this.usersService.changePassword(args);
  }

  /**
   * @deprecated its's migrated to changePin
   */
  @Patch('/:id/pin')
  async changePin(
    @Param() params: ChangePINParamsDto,
    @Body() body: ChangePINDto,
    @Query() query: ChangePINQueryDto,
  ): Promise<CommonResponseMessage> {
    const args = {
      user_id: params.id,
      pin: body.pin,
      token: query.token,
    };
    return this.usersService.changePin(args);
  }

  /**
   * @deprecated its's migrated to sendVerificationEmail
   */
  @Get('/:id/sendVerificationEmail')
  async sendVerificationEmail(
    @Param() params: SendVerificationEmailParamsDto,
  ): Promise<CommonResponseMessage> {
    return this.usersService.sendVerificationEmail(params.id);
  }

  /**
   * @deprecated its's migrated to verifyEmail
   */
  @Patch('/:id/verifyEmail')
  async verifyEmail(
    @Param() params: VerifyEmailParamsDto,
    @Query() query: VerifyEmailQueryDto,
  ): Promise<CommonResponseMessage> {
    const args = {
      user_id: params.id,
      token: query.token,
    };
    return this.usersService.verifyEmail(args);
  }

  /**
   * @deprecated its's migrated to addPin
   */
  @Post('/:id/pin')
  async addPin(
    @Param() params: AddPinParamsDto,
    @Body() body: AddPinDto,
  ): Promise<CommonResponseMessage> {
    return this.usersService.addPin(params.id, body.pin);
  }

  /**
   * @deprecated its's migrated to checkPin
   */
  @Post('/:id/checkPin')
  async checkPin(
    @Param() params: CheckPinParamsDto,
    @Body() body: CheckPinDto,
  ): Promise<CheckPinResponse> {
    return this.usersService.checkPin(params.id, body.pin);
  }

  /**
   * @description its's migrated to getUserScoreNewbut app side not used
   */
  @Get('/:id/score')
  async getUserScore(
    @Param() param: GetUserScoreParamDto,
  ): Promise<GetUserScoreResponseDto> {
    return this.usersService.getUserScore(param);
  }

  /**
   * @deprecated its's migrated to GetToolkitAnswersHistory
   */
  @Get('/get-tool-kit-answers-history')
  // @Roles(UserRoles.USER, UserRoles.ADMIN)
  // @UseGuards(AuthGuard, RolesGuard)
  async getToolKitHistory(
    @Query() query: ToolKitHistoryDTO,
    @GetUser() user: User,
  ): Promise<ToolKitAnswerHistoryDTO> {
    return this.usersService.getToolKitHistory(user, query);
  }

  /**
   * @deprecated its's migrated to getCampaigns
   */
  @Get('get-campaign-list')
  // @Roles(UserRoles.ADMIN)
  // @UseGuards(AuthGuard, RolesGuard)
  async getCampaignList(): Promise<CampaignListModel> {
    return this.usersService.getCampaignList();
  }

  /**
   * @description schedules event trigger are used
   */
  @Post('/new-schedule')
  // @Roles(UserRoles.ADMIN, UserRoles.USER)
  // @UseGuards(AuthGuard, RolesGuard)
  async createUserChallenges(@Body() body: UserScheduleDTO): Promise<unknown> {
    return this.usersService.createUserChallengesRecord(body);
  }

  /**
   * @deprecated unable to find in Action and Event
   */
  @Get('/get-challenge-ranking')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChallengesRanking(
    @Query() query: ChallengesRankingQueryDTO,
    @GetUser() user: User,
  ) {
    return this.usersService.getChallengeRanking(query, String(user.id));
  }

  /**
   * @deprecated its's migrated to getUserShopItemPriceAndHLPPoints
   */
  @Get('/get-shop-item-price-points')
  async getShopItemPriceAndHLPPoints(
    @Query() query: ShopItemPriceAndHLPPointsDTO,
  ): Promise<ShopItemPriceAndHLPPointsResponse> {
    return this.usersService.getShopItemPriceAndHLPPoints(query);
  }

  /**
   * @deprecated its's migrated to gettoolkitCategory
   */
  @Get('/get-tool-kits-by-category-and-user-goals')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async GetToolKitByUserGoalsAndToolKitCategory(
    @Query() query: ToolKitByUserGoalsAndToolKitCategoryDTO,
    @GetUser() user: User,
  ): Promise<ToolKitByUserGoalsAndToolKitCategoryResponse | undefined> {
    return this.usersService.GetToolKitByUserGoalsAndToolKitCategory(
      query.tool_kit_category_id,
      String(user.id),
    );
  }

  /**
   * @deprecated its's migrated to habitToolEndDate
   */
  @Get('/get-habit-tool-end-date')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async GetHabitToolEndDate(
    @Query() query: HabitToolEndDateDTO,
  ): Promise<GetHabitToolEndDateResponse> {
    return this.usersService.GetHabitToolEndDate(query);
  }

  /**
   * @deprecated its's migrated to  purchaseReminderTone
   */
  @Post('/buy-reminder-tone')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async buyReminderTone(@Body() body: BuyReminderToneDTO) {
    return this.usersService.buyReminderTone(body);
  }

  /**
   * @deprecated its's migrated to getTookitDetails app side not used
   */
  @Get('/check-if-user-has-joined-challenge')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async CheckIfUserHasJoinedChallenge(
    @Query() query: UserHasJoinedChallengeDTO,
    @GetUser() user: User,
  ) {
    return this.usersService.CheckIfUserHasJoinedChallenge(
      query.tool_kit_id,
      String(user.id),
      query.schedule_id,
    );
  }

  /**
   * @deprecated its's migrated to getExtraInformation
   */
  @Get('/get-extra-information')
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async GetExtraInformation(
    @Query() query: GetExtraInformationArgs,
  ): Promise<GetExtraInformationResponse> {
    return this.usersService.getExtraInformation(query, query.lang);
  }

  /**
   * @deprecated its's migrated to userPurchaseShopItem
   */
  // @Post('/purchaseShopItem')
  // @Roles(UserRoles.USER)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async purchaseShopItem(
  //   @GetUser() user: LoggedInUser,
  //   @Body() body: PurchaseShopItemBodyDto,
  // ): Promise<PurchaseShopItemResponseDto> {
  //   return this.usersService.purchaseShopItem(user.id, body.shopitemId);
  // }

  /**
   * @decription It is used for testing purpose
   */
  @Public()
  @Post('/webhook/stripe')
  async webhookStripe(@Req() request: any) {
    return this.usersService.webhookStripe(request);
  }

  /**
   * @description It is used for testing purpose
   */
  @Post('/create-dynamic-link')
  async createDynamicLink(@Body() body: DynamicLinkDto): Promise<{
    shortLink: string;
  }> {
    return this.firebaseDynamicLinksService.getAppUriSchemeWithPath(body.link);
  }

  /**
   * @deprecated follow_user event trigger not required
   */
  // @Post('/follow')
  // async followFriend(
  //   @Body() body: UserFriendsBodyDTO,
  // ): Promise<{ response: string }> {
  //   return this.usersService.friendFollow(body.data);
  // }

  /**
   * @desciption It is used for testing purpose
   */
  @Post('/test-email')
  // @Roles(UserRoles.ADMIN, UserRoles.USER)
  // @UseGuards(AuthGuard, RolesGuard)
  async sendMail(
    @Body() body: SendEmailInput,
  ): Promise<SendEmailCommandOutput> {
    return this.emailService.sendEmail(body);
  }

  /**@description add or update user to mailchimp list */
  @Put('/mailchimp-list/member')
  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addOrupdateUserToMailchimpList(
    @Body() body: UserIdBody,
  ): Promise<AddOrUpdateUserToMailchimpListResponse> {
    return await this.usersService.addOrUpdateUserToMailchimpList(body.userId);
  }
}
