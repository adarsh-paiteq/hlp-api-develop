import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@shared/auth/auth.service';
import {
  AdminSignupDto,
  BuyReminderToneDTO,
  CampaignInfo,
  CampaignList,
  CampaignListModel,
  ChallengeDetails,
  ChallengeRankingResponse,
  ChallengesRankingQueryDTO,
  CheckEmailDto,
  CommonResponseMessage,
  GetUserScoreParamDto,
  GetUserScoreResponseDto,
  HabitToolEndDateDTO,
  LoginDto,
  ShopItemPriceAndHLPPointsDTO,
  ShopItemPriceAndHLPPointsResponse,
  ShopitemPurchase,
  ToolKitByUserGoalsAndToolKitCategoryResponse,
  ToolKitHistoryDTO,
  User,
  UserFriendsBody,
  UserGoals,
  UserReminderTone,
  UserRoles,
  UserScheduleDTO,
  UserSignupDto,
  UserDonation,
  ToolKitAnswerHistoryDTO,
  GetHabitToolEndDateResponse,
  UserNotificationSettings,
  AgeGroups,
  UserUpdateDto,
} from './users.dto';
import { UsersRepo } from './users.repo';
import { SchedulesService } from '@schedules/schedules.service';
import * as datefns from 'date-fns';
import { RewardsService } from '../rewards/rewards.service';
import { TrophiesService } from '../trophies/trophies.service';
import { MembershipLevelsService } from '../membership-levels/membership-levels.service';
import { MembershipStagesService } from '../membership-stages/membership-stages.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FriendFollowedEvent,
  HLPPointsDonatedEvent,
  HLPPointsDonatedToCampaignEvent,
  ReduceUserHlpPointsEvent,
  ReminderTonePurchasedEvent,
  UserSignedUpEvent,
  UserEvent,
  ShopItemPaymentSucceededEvent,
  FriendRequestCreatedEvent,
} from './user.event';
import { BonusesService } from '../bonuses/bonuses.service';
import {
  IStripeEvent,
  IStripeEventObject,
  StripeService,
  WebhookEventType,
} from '@shared/services/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { ToolkitService } from '@toolkits/toolkit.service';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import {
  CheckPinResponse,
  GenerateTokens,
  AdminSignupResponse,
  OnboardingStatus,
  RefreshTokenResponse,
  UserDonationArgs,
  Users,
  UserSignupResponse,
  CheckEmailResponse,
  ChangePasswordArgs,
  UpdateUserNameArgs,
  ChangePinArgs,
  VerifyEmailArgs,
  GetHelpedUsersResponse,
  ChangeAdminOrEditorPasswordArgs,
  OnboardingScreen,
  Onboarding,
  AvatarType,
} from './users.model';
import { ChannelsEvent, PostThankYouEvent } from '../channels/channels.event';
import { EnvVariable } from '@core/configs/config';
import { EmailsService } from '../emails/emails.service';
import { PukQueue } from '../puk/puk.queue';
import { ContentEditorsService } from '../content-editors/content-editors.service';
import { totp } from 'otplib';
import { BlockedUserList, BlockUsertDto } from './dto/blocked-user.dto';
import { BlockedUsers } from './entities/blocked-users.entity';
import { UserQueryInput, UserFollowtDto, UpdateUserDto } from './dto/users.dto';
import { UserQuery } from './entities/user-queries.entity';
import { AboutUs } from './entities/about-us.entity';
import { TermAndCondition } from './entities/terms-and-conditions.entity';
import { UserSecurityAndPrivacySetting } from './entities/user-security-and-privacy-settings.entity';
import { UserFriend } from './entities/user-friend.entity';
import { SafeGuarding } from './entities/safeguarding.entity';
import { Advocacy } from './entities/advocacy.entity';
import {
  SupportVideoCategory,
  SupportVideosDetail,
} from './dto/get-support-video.dto';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { UserSecurityAndPrivacySettingInput } from './dto/user-security-privacy-setting.dto';
import { ContentEditorsRepo } from '../content-editors/content-editors.repo';
import {
  HabitToolEndDateArgs,
  HabitToolEndDateOutput,
} from './dto/habit-tool-end-date.dto';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import {
  GetExtraInformationResponse,
  GetExtraInformationArgs,
  EntityExtraInformation,
} from './dto/get-extra-information.dto';
import { DeleteUserArgs, DeleteUserResponse } from './dto/delete-user.dto';
import { GetUserScoreResponse } from './dto/get-user-score.dto';
import { GetProfileInfoResponse } from './dto/get-user-profile.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { RegisterUserInput, SaveUserInput } from './dto/register-user.dto';
import { UtilsService } from '../utils/utils.service';
import { GetUserAnonymousStatusResponse } from './dto/get-user-anonymous-status.dto';
import { GetMyToolsArgs, GetMyToolsResponse } from './dto/get-my-tools.dto';
import {
  PurchaseShopItemInput,
  PurchaseShopItemResponse,
  ShopItemTransactionStatus,
  ShopitemPurchaseDto,
  UpdateShopitemPurchase,
} from './dto/purchase-shop-item.dto';
import { ExtraInformation } from './entities/extrainformation.entity';
import {
  InsertUserFriendRequest,
  SendUserFriendRequestResponse,
} from './dto/send-friend-request.dto';
import {
  UpdateFriendRequestStatusInput,
  UpdateFriendRequestStatusResponse,
} from './dto/update-user-friend-request-status.dto';
import { RemoveUserFriendRequestResponse } from './dto/remove-user-friend-request.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetUserFriendRequestsResponse } from './dto/user-friend-request-list.dto';
import { ChannelInvitationStatus } from '@groups/entities/channel-invitations.entity';
import { SupportVideos } from './entities/support-videos.entity';
import { RemoveUserFriendResponse } from './dto/remove-friend.dto';
import { ResendUserFriendRequestResponse } from './dto/resend-friend-request.dto';
import { GetFriendsArgs, GetFriendsResponse } from './dto/get-user-friends.dto';
import { RedisService } from '@core/modules/redis/redis.service';
import { Server } from 'socket.io';
import { WEBSOCKET_CLIENT_EVENT } from '@core/constants';
import {
  UserStatus,
  UserStatusChangedBy,
} from './entities/user-status-info.entity';
import { AddUserStatusInfo } from './dto/add-user-status-info.dto';
import {
  PaitentInvitationStatus,
  PatientInvitation,
} from '@invitations/entities/patient-invitations.entity';
import {
  VerifyUserLoginOtpArgs,
  VerifyUserLoginResponse,
} from './dto/verify-user-login-otp.dto';
import { MollieService } from '@shared/services/mollie/mollie.service';
import { CreatePaymentParameters } from '@shared/services/mollie/mollie.dto';
import { UserAddress } from './entities/user-address.entity';
import { ResendUserLoginOtpResponse } from './dto/resend-user-login-otp.dto';
import {
  LoginResponse,
  UserSecuritySetting,
} from './dto/login-user-account.dto';
import { GetAccountInformationResponse } from './dto/get-account-information.dto';
import { UserRegistrationStatus } from '@oauth/entities/oauth-users.entity';
import {
  UpdateAvatarInput,
  UpdateAvatarResponse,
} from './dto/update-avatar-image.dto';
import { MailchimpService } from '@shared/services/mailchimp/mailchimp.service';
import {
  MailchimpListMemberStatus,
  MailchimpListMemberBody,
  AddOrUpdateUserToMailchimpListResponse,
} from '@shared/services/mailchimp/dto/mailchimp.dto';
import { Organisation } from '@organisations/entities/organisations.entity';
import {
  ChangeUserPasswordInput,
  ChangedPasswordResponse,
} from './dto/change-user-password.dto';
import { UpdateUserInput, UpdateUserResponse } from './dto/update-user.dto';
import { Trophy } from '@trophies/entities/trophy.entity';
import { BranchIOService } from '@shared/services/branch-io/branch-io.service';
import { UpdateUsernameResponse } from './dto/update-username.dto';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private readonly toolkitService: ToolkitService,
    private readonly userRepo: UsersRepo,
    private readonly authService: AuthService,
    private readonly scheduleService: SchedulesService,
    private readonly rewardsService: RewardsService,
    private readonly trophiesService: TrophiesService,
    private readonly membershipLevelsService: MembershipLevelsService,
    private readonly membershipStagesService: MembershipStagesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly bonusesService: BonusesService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly firebaseDynamicLinksService: FirebaseDynamicLinksService,
    private readonly emailsService: EmailsService,
    private readonly pukQueue: PukQueue,
    private readonly ContentEditorService: ContentEditorsService,
    private readonly contentEditorsRepo: ContentEditorsRepo,
    private readonly translationService: TranslationService,
    private readonly utilsService: UtilsService,
    private readonly redisService: RedisService,
    private readonly mollieService: MollieService,
    private readonly mailchimpService: MailchimpService,
    private readonly branchIoService: BranchIOService,
  ) {}

  private async saveUserAndGenerateTokens(
    user: UserSignupDto | AdminSignupDto | SaveUserInput,
  ): Promise<GenerateTokens> {
    const passwordHash = this.authService.hashPassword(user.password);
    const newUser = await this.userRepo.saveUser({
      ...user,
      password: passwordHash,
    });

    const tokens = await this.authService.getTokens(newUser);
    await this.userRepo.updateUserById(newUser.id, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  private async generateTestUserCredentials(
    user: Users,
  ): Promise<GenerateTokens> {
    const tokens = await this.authService.getTokens(user);
    await this.userRepo.updateUserById(user.id, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  async userSignup(userSignUpData: UserSignupDto): Promise<UserSignupResponse> {
    const { puk_reference_id, email, role } = userSignUpData;
    const pukTestId = this.configService.get(EnvVariable.PUK_TEST_ID) as string;
    userSignUpData.is_test_puk = puk_reference_id.includes(pukTestId);

    if (role !== UserRoles.USER) {
      throw new BadRequestException(`users.failed_user_signup`);
    }
    const [user] = await this.userRepo.getUserByEmailOrPukId(
      puk_reference_id,
      email,
      role,
    );
    const testEmail = this.configService.get(EnvVariable.TEST_USER_EMAIL);
    const isUserExists = user && email !== testEmail;
    const isTestUser = user && email === testEmail;

    if (isUserExists) {
      throw new BadRequestException(`users.exist_email_or_puk`);
    }
    if (isTestUser) {
      return this.generateTestUserCredentials(user);
    }
    const tokens = await this.saveUserAndGenerateTokens(userSignUpData);
    await Promise.all([
      this.userRepo.saveUserNotificationSettings(tokens.id),
      this.userRepo.saveUserSecurityAndPrivacySettings(tokens.id),
      this.userRepo.saveUserOnboarding(tokens.id),
    ]);
    return tokens;
  }

  /**@deprecated migrated to @function updateUsername  */
  async updateUserName(args: UpdateUserNameArgs): Promise<Users> {
    const { id, role, user_name } = args;
    const [user, exitingUser] = await Promise.all([
      this.userRepo.getUserById(id),
      this.userRepo.getUserByUserName(user_name, role),
    ]);
    if (exitingUser && user.user_name !== user_name) {
      this.logger.warn(`${exitingUser.user_name}`);
      throw new BadRequestException(`users.exist_screen_name`);
    }
    const blackListedUserNames =
      await this.userRepo.getAllBlackListedUserNames();
    const blackListedName = blackListedUserNames.find((name) => {
      const userName = user_name.toLowerCase();
      return userName.includes(name.user_name.toLowerCase());
    });
    if (blackListedName) {
      throw new BadRequestException(`users.screen_name_not_allowed`);
    }
    const [updatedUser] = await Promise.all([
      this.userRepo.updateUserById(id, {
        user_name: user_name,
      }),
      this.userRepo.updateOnboardingScreen(id, OnboardingScreen.avatar),
    ]);
    return updatedUser;
  }

  async updateUsername(
    userId: string,
    role: UserRoles,
    user_name: string,
  ): Promise<UpdateUsernameResponse> {
    const [user, exitingUser] = await Promise.all([
      this.userRepo.getUserById(userId),
      this.userRepo.getUserByUserName(user_name, role),
    ]);

    if (exitingUser && user.user_name !== user_name) {
      throw new BadRequestException(`users.exist_screen_name`);
    }

    const blackListedUserNames =
      await this.userRepo.getAllBlackListedUserNames();

    const blackListedName = blackListedUserNames.find((name) => {
      const userName = user_name.toLowerCase();
      return userName.includes(name.user_name.toLowerCase());
    });

    if (blackListedName) {
      throw new BadRequestException(`users.screen_name_not_allowed`);
    }

    const requests: [Promise<Users>, Promise<Onboarding | undefined>?] = [
      this.userRepo.updateUser(userId, { user_name }),
    ];

    if (!user.is_onboarded) {
      const updateOnboardingScreenRequest =
        this.userRepo.updateOnboardingScreen(userId, OnboardingScreen.avatar);
      requests.push(updateOnboardingScreenRequest);
    }

    await Promise.all(requests);

    const message = this.translationService.translate(`users.username_updated`);
    return { message };
  }

  async adminSignup(
    adminSignupData: AdminSignupDto,
  ): Promise<AdminSignupResponse> {
    const { email, role } = adminSignupData;
    if (role !== UserRoles.ADMIN) {
      throw new BadRequestException(`users.admin_signup_failed`);
    }
    const [users] = await this.userRepo.getUser(email, role);
    if (users) {
      throw new BadRequestException(`users.email_exist`);
    }

    const tokens = await this.saveUserAndGenerateTokens(adminSignupData);
    return tokens;
  }

  async checkEmail(checkEmailDto: CheckEmailDto): Promise<CheckEmailResponse> {
    const { email, role } = checkEmailDto;
    const [users] = await this.userRepo.getUser(email, role);
    const isExists = users ? true : false;
    return { isExists };
  }

  getEmailVerificationCode(userId: string): string {
    totp.options = { window: 5, digits: 4 };
    const code = totp.generate(userId);
    return code;
  }

  async login(creds: LoginDto): Promise<LoginResponse> {
    const [user] = await this.userRepo.getUser(creds.email, creds.role);

    if (!user) {
      throw new UnauthorizedException(`users.invalid_email`);
    }

    if (user.is_deleted) {
      throw new UnauthorizedException(`users.account_deleted`);
    }

    const isValid = this.authService.compareHash(creds.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException(`users.incorrect_password`);
    }

    // custom expiration for test user
    const testEmail = this.configService.get(EnvVariable.TEST_USER_EMAIL);
    const isTestUser = testEmail === creds.email;

    const expiration = isTestUser ? 100 : undefined; // in seconds

    const privacyAndSecuritySetting =
      await this.userRepo.getUserPrivacyAndSecuritySettingByUserId(user.id);

    if (!privacyAndSecuritySetting && user.role == UserRoles.USER) {
      throw new NotFoundException(`users.user_security_and_privacy_not_found`);
    }

    const tokens = privacyAndSecuritySetting?.otp_login_enabled
      ? await this.authService.getTempTokens(user)
      : await this.authService.getTokens(user, expiration);

    const updateUserInput: UserUpdateDto = {
      refresh_token: tokens.refresh_token,
    };

    if (privacyAndSecuritySetting?.otp_login_enabled) {
      const code = this.getEmailVerificationCode(user.id);

      (updateUserInput.refresh_token = null),
        (updateUserInput.email_verification_code = code);
      await this.emailsService.sendUserOTPLoginEmail(user.id, code);
    }

    const userSecuritySettings: UserSecuritySetting = {
      app_lock_enabled: privacyAndSecuritySetting?.app_lock_enabled || false,
      otp_login_enabled: privacyAndSecuritySetting?.otp_login_enabled || false,
    };

    const [, onboarding] = await Promise.all([
      this.userRepo.updateUserById(user.id, updateUserInput),
      this.userRepo.getOnboardingByUserId(user.id),
    ]);

    if (user.role == UserRoles.USER) {
      await this.pukQueue.LogActivity(user);
    }

    return { ...tokens, onboarding, userSecuritySettings };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    // verifyToken
    const { data, error } = await this.authService.verifyRefreshToken(token);
    if (error) {
      throw new UnauthorizedException(`users.expired_token`);
    }
    const user = await this.userRepo.getUserById(data.id);
    if (user.is_deleted) {
      throw new UnauthorizedException(`users.account_deleted`);
    }
    if (!user || user.role === UserRoles.CONTENT_EDITOR) {
      return this.ContentEditorService.refreshToken(user.id, token);
    }
    const isValid = String(user.refresh_token) !== String(token);
    if (isValid) {
      throw new UnauthorizedException(`users.invalid_token`);
    }
    const tokens = await this.authService.getTokens({
      id: data.id,
      role: user.role,
      email: user.email,
      organization_id: user.organization_id,
    });
    await this.userRepo.updateUserById(user.id, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  async changePassword(
    args: ChangePasswordArgs,
  ): Promise<CommonResponseMessage> {
    const { id, token, password } = args;
    this.logger.log(args);
    const user = await this.userRepo.getUserById(id);
    if (!user) {
      throw new BadRequestException(`users.user_name_not_exist`);
    }
    const isTokenValid = String(user.forgot_password_token) === String(token);
    if (!isTokenValid) {
      throw new BadRequestException(`users.invalid_token`);
    }
    const { error } = await this.authService.verifyChangePasswordToken(token);
    if (error) {
      throw new BadRequestException(`users.invalid_expired`);
    }
    const passwordHash = this.authService.hashPassword(password);
    await this.userRepo.updateUserById(user.id, {
      password: passwordHash,
      forgot_password_token: null,
    });
    return {
      message: this.translationService.translate(`users.password_updated`),
    };
  }

  async forgotPassword(email: string): Promise<CommonResponseMessage> {
    const [user] = await this.userRepo.getUser(email, UserRoles.USER);
    if (!user) {
      throw new NotFoundException(`users.invalid_email`);
    }
    if (user.is_deleted) {
      throw new UnauthorizedException(`users.account_deleted`);
    }
    const changePasswordToken =
      await this.authService.generateChangePasswordToken(user);
    //save token in user
    await this.userRepo.updateUserById(user.id, {
      forgot_password_token: changePasswordToken,
    });

    /**
     * weburl for desktop
     */
    const env = this.configService.getOrThrow(EnvVariable.NODE_ENV);
    const webUrlDomain = this.configService.getOrThrow(EnvVariable.WEB_URL);
    const dynamicLinkQueryParams = `id=${user.id}&token=${changePasswordToken}&env=${env}`;
    const webUrl = `${webUrlDomain}?${dynamicLinkQueryParams}`;
    const dynamicLinkPath = `/password_reset?${dynamicLinkQueryParams}`;
    const { shortLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(
        dynamicLinkPath,
        webUrl,
      );

    await this.emailsService.sendForgotPassword(user.id, shortLink);
    const message = this.translationService.translate(`users.email_sent`);

    return { message };
  }
  async sendForgotPinEmail(email: string): Promise<CommonResponseMessage> {
    const [user] = await this.userRepo.getUser(email, UserRoles.USER);
    if (!user) {
      throw new NotFoundException(`users.invalid_email`);
    }
    if (user.is_deleted) {
      throw new UnauthorizedException(`users.account_deleted`);
    }
    const changePinToken = await this.authService.generateChangePasswordToken(
      user,
    );
    // //save token in user
    await this.userRepo.updateUserById(user.id, {
      forgot_pin_token: changePinToken,
    });
    const dynamicLinkPath = `/reset_pincode?id=${user.id}&token=${changePinToken}`;

    const { shortLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(dynamicLinkPath);

    const data = await this.emailsService.sendForgetPin(user, shortLink);
    this.logger.log(data);
    const isSent = data && data.MessageId;
    const message = isSent
      ? this.translationService.translate(`users.email_sent`)
      : this.translationService.translate(`users.failed_email_sent`);

    return { message: message };
  }

  async changePin(args: ChangePinArgs): Promise<CommonResponseMessage> {
    const { pin, token, user_id } = args;
    const user = await this.userRepo.getUserById(user_id);
    if (!user) {
      throw new BadRequestException(`users.user_name_not_exist`);
    }
    this.logger.log(user);
    const isValid = String(user.forgot_pin_token) === String(token);
    if (!isValid) {
      throw new BadRequestException('users.invalid_token');
    }
    const pinHash = this.authService.generateHash(pin);
    await this.userRepo.updateUserById(user.id, {
      app_access_pin: pinHash,
      forgot_pin_token: null,
    });
    return { message: this.translationService.translate(`users.Pin_updated`) };
  }

  async sendVerificationEmail(userId: string): Promise<CommonResponseMessage> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const emailVerificationToken =
      await this.authService.generateEmailVerificationToken(user);
    //save token in user
    await this.userRepo.updateUserById(user.id, {
      email_verification_token: emailVerificationToken,
    });
    const dynamicLinkPath = `/dashboard?id=${user.id}&token=${emailVerificationToken}`;
    const { shortLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(dynamicLinkPath);

    const data = await this.emailsService.sendVerifyEmail(user.id, shortLink);
    this.logger.log(data);
    const isSent = data && data.MessageId;
    const message = isSent
      ? this.translationService.translate(`users.email_sent`)
      : this.translationService.translate(`users.failed_email_sent`);

    return { message: message };
  }

  async verifyEmail(args: VerifyEmailArgs): Promise<CommonResponseMessage> {
    const { token, user_id } = args;
    const user = await this.userRepo.getUserById(user_id);
    if (!user) {
      throw new BadRequestException(`users.user_not_found`);
    }
    // TODO: remove this after testing
    const testEmail = this.configService.get(EnvVariable.TEST_USER_EMAIL);
    const isTokenValid =
      String(user.email_verification_token) === String(token) ||
      user.email === testEmail;
    if (!isTokenValid) {
      throw new BadRequestException(`users.invalid_token`);
    }
    const { error } = await this.authService.verifyEmailVerificationToken(
      token,
    );
    if (error) {
      throw new BadRequestException(`users.expired_token`);
    }
    await Promise.all([
      this.userRepo.updateUserById(user.id, {
        email_verification_token: null,
      }),
      this.pukQueue.confirmRegistration(user),
    ]);

    return {
      message: this.translationService.translate(`users.email_verified`),
    };
  }

  async checkPin(id: string, pin: string): Promise<CheckPinResponse> {
    const user = await this.userRepo.getUserById(id);
    if (!user) {
      throw new BadRequestException(`users.user_not_found`);
    }
    if (!user.app_access_pin) {
      throw new BadRequestException(`users.app_pin_enabled`);
    }
    const isValid = this.authService.compareHash(pin, user.app_access_pin);
    if (!isValid) {
      throw new BadRequestException(`users.pin_incorrect`);
    }
    const tokens = await this.authService.getTokens(user);
    const [, onboarding] = await Promise.all([
      this.userRepo.updateUserById(user.id, {
        refresh_token: tokens.refresh_token,
      }),
      this.userRepo.getOnboardingByUserId(user.id),
    ]);

    return { ...tokens, onboarding };
  }

  async addPin(id: string, pin: string): Promise<CommonResponseMessage> {
    const user = await this.userRepo.getUserById(id);
    if (!user) {
      throw new BadRequestException(`users.user_not_found`);
    }
    const pinHash = this.authService.generateHash(pin);
    await this.userRepo.updateUserById(user.id, {
      app_access_pin: pinHash,
      app_lock_enabled: true,
    });
    return { message: this.translationService.translate(`users.app_enabled`) };
  }

  /**
   * This function is deprecated and should not be used.
   * Use the @function getAnswersHistory() function instead in toolkits module.
   * @deprecated
   */
  async getToolKitHistory(
    user: User,
    query: ToolKitHistoryDTO,
  ): Promise<ToolKitAnswerHistoryDTO> {
    return this.userRepo.getToolKitAnswerHistory(query);
  }

  /**
   * @description schedules event trigger are used
   */
  async createUserChallengesRecord(data: UserScheduleDTO): Promise<unknown> {
    if (data.challenge_id) {
      return this.userRepo.createUserChallengesRecord(data);
    }
  }

  /**
   * @deprecated its's migrated to getCampaigns
   */
  async getCampaignList(): Promise<CampaignListModel> {
    const campaigns = await this.userRepo.getAllCampaignList();
    return this.filterCampaignByCompletionStatus(campaigns);
  }

  /**
   * @deprecated its's migrated to getCampaigns
   */
  // map campaign based on their status
  private filterCampaignByCompletionStatus(
    campaigns: Array<CampaignInfo>,
  ): CampaignListModel {
    const campaign_list: CampaignListModel = {
      campaigns: [],
      previous_campaigns: [],
    };
    campaigns.forEach((campaign) => {
      const campaign_info: CampaignList = {
        title: campaign.title,
        image_id: campaign.image_id,
        id: campaign.id,
        image_url: campaign.image_url,
        file_path: campaign.file_path,
        campaign_goal: campaign.campaign_goal,
        is_campaign_goal_fulfilled: campaign.is_campaign_goal_fulfilled,
        total_hlp_points_donated:
          campaign.campaign_donations_aggregate.aggregate.sum
            .hlp_reward_points_donated || 0,
        short_description: campaign.short_description,
      };
      if (!campaign.is_campaign_goal_fulfilled) {
        campaign_list.campaigns.push(campaign_info);
      } else {
        campaign_list.previous_campaigns.push(campaign_info);
      }
    });
    // campaign_list.campaigns = campaigns.filter(
    //   (campaign) => !campaign.is_campaign_goal_fulfilled
    // );
    // campaign_list.previous_campaigns = campaigns.filter(
    //   (campaign) => campaign.is_campaign_goal_fulfilled
    // );
    return campaign_list;
  }

  /**
   *@deprecated unable to find in Action
   */
  async getChallengeRanking(
    challenge_ranking_query: ChallengesRankingQueryDTO,
    user_id?: string,
  ): Promise<ChallengeRankingResponse> {
    const challenge_info: ChallengeDetails =
      await this.userRepo.getChallengeDetails(
        challenge_ranking_query.challenge_id,
      );
    const res = await this.userRepo.getUserChallenges(
      challenge_ranking_query.challenge_id,
      challenge_info.tool_kit.tool_kit_type,
    );
    const challenge_ranking_info: ChallengeRankingResponse = {
      title: challenge_info.title,
      challenge_end_date: challenge_info.challenge_end_date,
      total_days: challenge_info.total_days,
      hlp_reward_points_required_for_completing_goal:
        challenge_info.hlp_reward_points_required_for_completing_goal,
      hlp_reward_points_required_for_winning_challenge:
        challenge_info.hlp_reward_points_required_for_winning_challenge,
      is_challenge_completed: challenge_info.is_challenge_completed,
      user_rankings: [],
      days_passed: datefns.differenceInDays(
        new Date(challenge_ranking_query.current_date),
        new Date(challenge_info.challenge_start_date),
      ),
    };
    res.user_challenges = res.user_challenges.sort(
      (a: any, b: any) =>
        b.user[res.table_name].aggregate.sum.hlp_points_earned -
        a.user[res.table_name].aggregate.sum.hlp_points_earned,
    );
    res.user_challenges.forEach((challenge: any) => {
      challenge_ranking_info.user_rankings.push({
        id: challenge_ranking_info.user_rankings.length + 1,
        user_id: challenge.user.id,
        user_name: challenge.user.user_name,
        full_name:
          challenge.user.id === user_id
            ? `${challenge.user.full_name} (me)`
            : challenge.user.full_name,
        hlp_points_earned:
          challenge.user[res.table_name].aggregate.sum.hlp_points_earned || 0,
        avatar: challenge.user.avatar,
      });
    });
    return challenge_ranking_info;
  }

  public async getShopItemPriceAndHLPPoints(
    query: ShopItemPriceAndHLPPointsDTO,
  ): Promise<ShopItemPriceAndHLPPointsResponse> {
    const { user_id, shop_item_id } = query;
    const shopItem = await this.userRepo.getShopItem(shop_item_id);
    if (!shopItem) {
      throw new NotFoundException(`users.shop_item_not_found`);
    }
    const [shopItemPrices, userMembershipStages] = await Promise.all([
      this.userRepo.getShopItemPrices(shop_item_id),
      this.userRepo.getUserMemberStages(user_id),
    ]);
    const item_price_and_points: ShopItemPriceAndHLPPointsResponse = {
      hlp_points: shopItem.hlp_points_required_to_buy_item,
      message: '',
      item_price: shopItem.item_price,
      shipping_cost: shopItem.shipping_cost,
    };
    if (!shopItemPrices.length) {
      this.logger.warn(`no pricese found for ${shopItem.id}`);
      return item_price_and_points;
    }
    const membershipStageIds = userMembershipStages.map(
      (stage) => stage.membership_stage_id,
    );
    const itemPrice = shopItemPrices.find((item) =>
      membershipStageIds.includes(item.membership_stage_id),
    );
    if (itemPrice) {
      item_price_and_points.hlp_points = itemPrice.hlp_reward_points_required;
      if (itemPrice.item_price) {
        item_price_and_points.item_price = itemPrice.item_price;
      }
    }
    if (!itemPrice) {
      this.logger.warn('Default prices');
    }
    return item_price_and_points;
  }

  /**
   * This function is deprecated and should not be used.
   * This code is only included for backward compatibility.
   * Use the @function getUserScoreNew() function instead.
   * @deprecated
   */

  async getUserScore(
    param: GetUserScoreParamDto,
    lang?: string,
  ): Promise<GetUserScoreResponseDto> {
    const { id: userId } = param;
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    const myBalance = await this.rewardsService.getUserBalance(userId);
    const [trophies, membershipLevels, membershipStages, { bonuses }] =
      await Promise.all([
        this.trophiesService.getUserTrophiesSummary(userId),
        this.membershipLevelsService.getUserMembershipLevelSummary({
          userId: user.id,
          points: myBalance.earned,
          lang,
        }),
        this.membershipStagesService.getUserMembershipStagesSummary({
          userId: user.id,
          points: myBalance.earned,
          lang,
        }),
        this.bonusesService.getBonuses({ id: user.id }),
      ]);
    const bonusesCount = bonuses.filter(
      (bonus) => bonus.can_claim && !bonus.is_claimed,
    ).length;
    const response: GetUserScoreResponseDto = {
      my_balance: { ...myBalance, total: user.hlp_reward_points_balance },
      membership_levels: membershipLevels,
      membership_stages: membershipStages,
      trophies,
      bonuses: bonusesCount,
    };
    return response;
  }

  /**
   * This function is deprecated and should not be used.
   * Use the @function GetToolkitCategory() function instead in toolkit-category module.
   * @deprecated
   */
  public async GetToolKitByUserGoalsAndToolKitCategory(
    tool_kit_category: string,
    user_id: string,
  ): Promise<ToolKitByUserGoalsAndToolKitCategoryResponse | undefined> {
    const user_goals: Array<UserGoals> = await this.userRepo.getUserGoals(
      user_id,
    );
    if (user_goals.length) {
      const goal_filters: Array<string> = user_goals.map((goal) => goal.goal);
      const tool_kit_info: any =
        await this.userRepo.GetToolKitByUserGoalsAndToolKitCategory(
          tool_kit_category,
          goal_filters,
        );
      const tool_kit_by_user_goals: ToolKitByUserGoalsAndToolKitCategoryResponse =
        {
          tool_kit_category_info: tool_kit_info.tool_kit_category_by_pk,
          sub_categories: tool_kit_info.tool_kit_sub_category,
          whats_new_tool_kits: tool_kit_info.tool_kits,
        };
      return tool_kit_by_user_goals;
    }
  }

  public async GetHabitToolEndDate(
    query: HabitToolEndDateDTO,
  ): Promise<GetHabitToolEndDateResponse> {
    const tool_kit_info: any = await this.userRepo.getHabitToolEndDate(
      query.tool_kit_id,
    );

    if (tool_kit_info) {
      const endDate = datefns.addDays(
        new Date(query.current_date),
        tool_kit_info.habit_duration,
      );
      return { endDate };
    } else {
      return { endDate: null };
    }
  }

  /**
   * This function is deprecated and should not be used.
   * Use the @function purchaseReminderTone() function instead in purchased-remainder-tones module.
   * @deprecated
   */
  public async buyReminderTone(
    body: BuyReminderToneDTO,
  ): Promise<{ message: string } | undefined> {
    const check_if_already_purchased: Array<any> =
      await this.userRepo.checkUserReminderTonePurchaseHistory(body);
    if (check_if_already_purchased.length) {
      return {
        message: this.translationService.translate(
          `users.already_purchase_reminder_tone`,
        ),
      };
    } else {
      const response = await this.userRepo.purchaseReminderTone(body);
      if (response) {
        this.eventEmitter.emit(
          UserEvent.REMINDER_TONE_PURCHASED,
          new ReminderTonePurchasedEvent(response),
        );
        return {
          message: this.translationService.translate(
            `users.reminder_tone_purchased_successfully`,
          ),
        };
      }
    }
  }

  /**
   * This function is deprecated and should not be used.
   * Use the @function getToolkitDetails() function instead in toolkits module.
   * @deprecated
   */
  public async CheckIfUserHasJoinedChallenge(
    tool_kit_id: string,
    user_id: string,
    schedule_id: string,
  ) {
    const tool_kit_challenges: any = await this.userRepo.getToolKitChallenges(
      tool_kit_id,
    );
    let challenges: Array<string> = [];
    if (tool_kit_challenges.challenges.length) {
      challenges = Array.from(tool_kit_challenges.challenges).map(
        (val: any) => val.id,
      );
      const user_challenges: any = await this.userRepo.getUserChallengesList(
        user_id,
        challenges,
      );
      const remainingToolkitData =
        await this.toolkitService.getRemainingToolkitDataForCheckIfUserHasJoinedChallange(
          tool_kit_id,
          user_id,
          schedule_id,
        );
      return {
        user_joined_challenge: user_challenges.user_challenges.length
          ? true
          : false,
        challenge_id: user_challenges.user_challenges.length
          ? user_challenges.user_challenges[0].challenge_id
          : challenges[0],
        ...remainingToolkitData,
      };
    } else {
      return {
        message: this.translationService.translate(`users.tool_kit_not_linked`),
        user_joined_challenge: false,
        challenge_id: null,
      };
    }
  }

  async reducePointsForReminderTonePurchase(
    reminderTone: UserReminderTone,
  ): Promise<void> {
    const { reminder_tone_id: id, user_id } = reminderTone;
    const tone = await this.userRepo.getReminderTone(id);
    if (!tone) {
      this.logger.log(`reminder tone not found ${id}`);
      return;
    }
    const { hlp_points_needed_to_purchase_this_tone: points } = tone;
    const response = await this.userRepo.reduceHlpPoints(points, user_id);
    if (!response) {
      this.logger.log('Insufficient HLP Point ');
      return;
    }
    this.logger.log(
      `reduced  ${points},current user ${response?.user_name} points ${response?.hlp_reward_points_balance}`,
    );
  }

  public async getExtraInformation(
    data: GetExtraInformationArgs,
    lang: string,
  ): Promise<GetExtraInformationResponse> {
    const response = await this.userRepo.getExtraInformation(data);
    const [translatedExtraInformation] =
      this.translationService.getTranslations<
        ExtraInformation | EntityExtraInformation
      >(
        [response],
        ['extra_information_title', 'extra_information_description'],
        lang,
      );
    const title = translatedExtraInformation?.extra_information_title || '';
    const description =
      translatedExtraInformation?.extra_information_description || '';
    return { title, description };
  }

  async webhookStripe(request: any): Promise<{ message: string } | null> {
    const sig = request.headers['stripe-signature'];
    const event = this.stripeService.webhookVerify(request.rawBody, sig);
    this.logger.log(`Stripe webhook data`);
    this.logger.log(event);
    if (event.data.object.metadata.purchaseId) {
      return this.handleShopItemPurchase(event);
    }

    return null;
  }

  private async handleShopItemPurchase(
    event: IStripeEvent,
  ): Promise<{ message: string } | null> {
    if (event.type === WebhookEventType.SUCCEEDED) {
      const session = event.data.object as IStripeEventObject;
      const purchaseId = session.metadata.purchaseId as string;
      const [paymentType] = session.payment_method_types;
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.SUCCESS,
        transaction_reference_id: session.id,
        event_id: event.id,
        payment_type: paymentType,
      };
      const shopPurchasedItem = await this.userRepo.updateShopItemPurchase(
        purchaseId,
        purchasedItem,
      );
      this.eventEmitter.emit(
        UserEvent.SHOP_ITEM_PURCHASED,
        new ShopItemPaymentSucceededEvent(shopPurchasedItem),
      );
      this.logger.log(`Payment Successful, ${session.id} `);
      return { message: `Payment Successful` };
    } else if (event.type === WebhookEventType.FAILED) {
      const session = event.data.object;
      const purchaseId = session.metadata.purchaseId as string;
      const [paymentType] = session.payment_method_types;
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.FAILED,
        transaction_reference_id: session.id,
        event_id: event.id,
        payment_type: paymentType,
      };
      await this.userRepo.updateShopItemPurchase(purchaseId, purchasedItem);
      this.logger.log(`Payment failed, ${session.id} `);
      return { message: `Payment Failed` };
    } else if (event.type === WebhookEventType.CANCELED) {
      const session = event.data.object;
      const purchaseId = session.metadata.purchaseId as string;
      const [paymentType] = session.payment_method_types;
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.CANCELED,
        transaction_reference_id: session.id,
        event_id: event.id,
        payment_type: paymentType,
      };
      await this.userRepo.updateShopItemPurchase(purchaseId, purchasedItem);
      this.logger.log(`Payment canceled, ${session.id} `);
      return { message: `Payment canceled` };
    }
    return null;
  }

  async generatePaymentIntent(
    purchaseId: string,
    order_id: string,
    grandTotal: string,
    address: UserAddress,
  ): Promise<CreatePaymentParameters> {
    const {
      hometown,
      house_addition,
      street_address,
      postal_code,
      first_name,
      last_name,
    } = address;
    const name = `${first_name} ${last_name}`;
    const currency = this.configService.getOrThrow(EnvVariable.CURRENCY);
    const webhookUrl = this.configService.getOrThrow(
      EnvVariable.MOLLIE_WEBHOOK_URL,
    );
    const doctorWebUrl = this.configService.getOrThrow(
      EnvVariable.DOCTOR_WEB_URL,
    );
    const intent: CreatePaymentParameters = {
      amount: {
        currency: currency,
        value: grandTotal,
      },
      description: 'SuperBrains Mollie payment',
      metadata: { purchase_id: purchaseId, order_id },
      shippingAddress: {
        streetAndNumber: street_address || '',
        streetAdditional: house_addition,
        postalCode: postal_code,
        givenName: name,
        city: hometown || '', //home town is required when user save the address
        country: 'US',
      },
      redirectUrl: `${doctorWebUrl}/payment`,
      webhookUrl: webhookUrl,
    };
    return intent;
  }

  async purchaseShopItem(
    userId: string,
    input: PurchaseShopItemInput,
  ): Promise<PurchaseShopItemResponse> {
    const { shop_item_id, item_quantity, item_size } = input;

    const [userAddress, prices] = await Promise.all([
      this.userRepo.getUserAddress(userId),
      this.getShopItemPriceAndHLPPoints({
        shop_item_id,
        user_id: userId,
      }),
    ]);

    if (!userAddress) {
      throw new NotFoundException(`users.address_not_found`);
    }

    const { item_price, shipping_cost, hlp_points } = prices;
    const shippingCost = Number(shipping_cost);

    if (!item_price) {
      throw new BadRequestException(`users.shopt_item_price_not_available`);
    }

    const taxPercentage = this.configService.getOrThrow<number>(
      EnvVariable.TAX_PERCENTAGE,
    );

    const subTotal = +(item_price * item_quantity).toFixed(2);
    const taxAmount = parseFloat(((taxPercentage / 100) * subTotal).toFixed(2));
    const grandTotal = (subTotal + taxAmount + shippingCost).toFixed(2);

    const shopItemPurchaseInput: ShopitemPurchaseDto = {
      shop_item_id,
      item_size,
      item_quantity,
      item_price,
      user_id: userId,
      user_address_id: userAddress.id,
      tax: taxAmount,
      tax_percentage: taxPercentage,
      shipping_charges: shippingCost,
      transaction_status: ShopItemTransactionStatus.PENDING,
      sub_total: subTotal,
      grand_total: grandTotal,
    };
    if (hlp_points) {
      shopItemPurchaseInput.hlp_reward_points_redeemd = hlp_points;
    }

    const shopItemPurchase = await this.userRepo.saveShopItemPurchase(
      shopItemPurchaseInput,
    );
    const order_id = this.utilsService.addPrefixInOrderId(
      shopItemPurchase.order_id,
    );
    const intent = await this.generatePaymentIntent(
      shopItemPurchase.id,
      order_id,
      grandTotal,
      userAddress,
    );
    const paymentIntent = await this.mollieService.createPayment(intent);
    if (!paymentIntent.id) {
      throw new BadRequestException(`users.failed_shop_item_purchase`);
    }

    const checkout_url = paymentIntent.getCheckoutUrl();
    if (!checkout_url) {
      throw new BadRequestException(`users.checkout_url_not_found`);
    }

    const response: PurchaseShopItemResponse = {
      payment_secret: paymentIntent.id,
      checkout_url: checkout_url,
      order: shopItemPurchase,
    };

    return response;
  }

  async reducePointsForShopItemPurchase(
    purchasedItem: ShopitemPurchase,
  ): Promise<void> {
    const { user_id, shop_item_id } = purchasedItem;
    const { hlp_points } = await this.getShopItemPriceAndHLPPoints({
      user_id: user_id,
      shop_item_id: shop_item_id,
    });
    const hlpPoints = hlp_points as number;
    const response = await this.userRepo.reduceHlpPoints(hlpPoints, user_id);
    this.logger.log(
      `current user ${response?.user_name} points ${response?.hlp_reward_points_balance}`,
    );
  }

  async donateHlpPoints(
    userDonationArgs: UserDonationArgs,
    donorUserId: string,
  ): Promise<Users> {
    const { hlpRewardPointsDonated, receiverUserId, postId } = userDonationArgs;

    if (donorUserId === receiverUserId) {
      throw new BadRequestException(`users.failed_donate`);
    }
    const { hlp_reward_points_balance: hlpRewardPointsBalance } =
      await this.userRepo.getUserById(donorUserId);

    const isUserCanDonate =
      hlpRewardPointsBalance != null &&
      hlpRewardPointsBalance >= hlpRewardPointsDonated;

    if (!isUserCanDonate) {
      throw new BadRequestException(`users.insufficient_hlp_point_donate`);
    }
    const [donorUser, receiverUser] = await Promise.all([
      this.userRepo.reduceHlpPoints(hlpRewardPointsDonated, donorUserId),
      this.userRepo.addHlpPoints(hlpRewardPointsDonated, receiverUserId),
    ]);

    if (!donorUser || !receiverUser) {
      throw new BadRequestException(`users.failed_donate_hlp_point`);
    }

    const userDonation: UserDonation = {
      donor_user_id: donorUserId,
      hlp_reward_points_donated: hlpRewardPointsDonated,
      receiver_user_id: receiverUserId,
    };
    if (postId) {
      userDonation.post_id = postId;
    }
    const newUserDonation = await this.userRepo.addUserDonations(userDonation);
    if (!newUserDonation) {
      throw new BadRequestException(`users.failed_save_user_donation`);
    }
    const event = postId
      ? ChannelsEvent.CHANNEL_POST_THANK_YOU
      : UserEvent.HLP_POINTS_DONATED;
    const data = postId
      ? new PostThankYouEvent(newUserDonation)
      : new HLPPointsDonatedEvent(newUserDonation);

    this.eventEmitter.emit(event, data);
    return donorUser;
  }

  async reduceDonatedPointsForCampaign(
    body: HLPPointsDonatedToCampaignEvent,
  ): Promise<void> {
    const { userId, points } = body;
    const user = await this.userRepo.reduceHlpPoints(points, userId);
    this.logger.log(
      `${user?.id} current hlp points ${user?.hlp_reward_points_balance}`,
    );
  }

  /**
   * @deprecated follow_user event trigger not in use
   */
  async friendFollow(body: UserFriendsBody): Promise<{ response: string }> {
    const [followedFriend] = await this.userRepo.getFriendFollowed(body);

    if (!followedFriend) {
      throw new BadRequestException(`users.not_followed_friend`);
    }
    this.eventEmitter.emit(
      UserEvent.FRIEND_FOLLOWED,
      new FriendFollowedEvent(followedFriend),
    );
    return {
      response: this.translationService.translate(`users.followed_friend`),
    };
  }

  async getUserOnboarding(userId: string): Promise<OnboardingStatus> {
    const user = await this.userRepo.getUserByIdNew(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const onboarding = await this.userRepo.getUserOnboarding(userId);
    if (!onboarding) {
      throw new NotFoundException(`users.onboarding_not_found`);
    }
    const testUser = this.configService.get(EnvVariable.TEST_USER_EMAIL);
    const isTestUser = testUser === user.email;
    let is_completed = onboarding.is_completed;
    if (isTestUser) {
      this.logger.log(`Test user`);
      is_completed = false;
    }
    return {
      ...onboarding,
      isTestUser,
      is_completed,
    };
  }

  async reduceHlpPoints(body: ReduceUserHlpPointsEvent): Promise<string> {
    const { userId, points } = body;
    const user = await this.userRepo.reduceHlpPoints(points, userId);
    const message = `${user?.full_name} current hlp points ${user?.hlp_reward_points_balance}`;
    this.logger.log(message);
    return message;
  }

  async getHelpedUsers(userId: string): Promise<GetHelpedUsersResponse> {
    const users = await this.userRepo.getHelpedUsers(userId);
    return {
      users,
    };
  }

  async getFriendsList(userId: string): Promise<GetHelpedUsersResponse> {
    const users = await this.userRepo.getFriendsList(userId);
    return {
      users,
    };
  }

  async sendVerificationCode(userId: string): Promise<CommonResponseMessage> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    totp.options = { window: 5, digits: 4 };
    const code = totp.generate(user.email);
    await Promise.all([
      this.userRepo.updateUserById(userId, {
        email_verification_code: code,
      }),
      this.userRepo.updateOnboardingScreen(userId, OnboardingScreen.pin_code),
    ]);
    const dynamicLinkPath = `/otp_verification/?id=${user.id}&otp=${code}`;
    const { shortLink } =
      this.firebaseDynamicLinksService.getAppUriSchemeWithPath(dynamicLinkPath);
    await this.emailsService.sendVerifyEmail(user.id, shortLink, code);
    return {
      message: this.translationService.translate(`users.email_sent`),
    };
  }

  async verifyVerificationCode(
    userId: string,
    code: string,
  ): Promise<CommonResponseMessage> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const isCodeInvalid =
      user.email_verification_code !== code ||
      !totp.verify({ token: user.email_verification_code, secret: user.email });

    if (isCodeInvalid) {
      throw new BadRequestException(`users.pin_incorrect`);
    }

    const promises: [
      Promise<Users>?,
      Promise<Onboarding>?,
      Promise<PatientInvitation>?,
    ] = [
      this.userRepo.updateUserById(user.id, {
        email_verification_code: null,
        is_onboarded: true,
      }),
      // this.pukQueue.confirmRegistration(user),
      this.userRepo.updateOnboarding(userId, {
        is_completed: true,
        screen: OnboardingScreen.email_verification,
      }),
    ];

    if (user.invitation_id) {
      const updateInvitationPromise =
        this.userRepo.updatePatientInvitationStatus(
          user.invitation_id,
          user.email,
          PaitentInvitationStatus.ACCEPTED,
        );
      promises.push(updateInvitationPromise);
    }

    await Promise.all(promises);

    this.eventEmitter.emit(
      UserEvent.USER_SIGNED_UP,
      new UserSignedUpEvent(user),
    );
    return {
      message: this.translationService.translate(`users.email_verified`),
    };
  }

  async getBlockedUserList(userId: string): Promise<BlockedUserList[]> {
    const blockedUser = await this.userRepo.getBlockedUserList(userId);
    return blockedUser;
  }
  async updateFullName(userId: string, fullName: string): Promise<Users> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const [fullNameUser] = await Promise.all([
      this.userRepo.updateFullName(userId, fullName),
      this.userRepo.updateOnboardingScreen(
        userId,
        OnboardingScreen.screen_name,
      ),
    ]);
    return fullNameUser;
  }
  async addUserQuery(
    userId: string,
    input: UserQueryInput,
  ): Promise<UserQuery> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }

    const userQuery = await this.userRepo.addUserQuery(userId, input);
    return userQuery;
  }

  async getSupportVideoInfo(lang: string): Promise<SupportVideoCategory[]> {
    const supportVideoCategory = await this.userRepo.getSupportVideoInfo();
    if (!supportVideoCategory) {
      throw new NotFoundException(`users.support_video_not_found`);
    }

    const translatedSupportVideoCategory =
      this.translationService.getTranslations<SupportVideoCategory>(
        supportVideoCategory,
        ['title'],
        lang,
      );

    const updatedTranslatedSupportVideoCategory =
      translatedSupportVideoCategory.map((category) => {
        const translatedSupportVideos =
          this.translationService.getTranslations<SupportVideos>(
            category.support_videos,
            ['title', 'short_description'],
            lang,
          );
        return { ...category, support_videos: translatedSupportVideos };
      });

    return updatedTranslatedSupportVideoCategory;
  }

  async getAboutUs(lang: string): Promise<AboutUs> {
    const aboutUs = await this.userRepo.getAboutUs();
    if (!aboutUs) {
      throw new NotFoundException(`users.about_not_found`);
    }
    const [translatedAboutUs] =
      this.translationService.getTranslations<AboutUs>(
        [aboutUs],
        ['description'],
        lang,
      );
    return translatedAboutUs;
  }

  async getTermsAndConditions(lang: string): Promise<TermAndCondition> {
    const termAndCondition = await this.userRepo.getTermsAndConditions();
    if (!termAndCondition) {
      throw new NotFoundException(`users.term_and_condition_not_found`);
    }
    const [translatedTermAndCondition] =
      this.translationService.getTranslations<TermAndCondition>(
        [termAndCondition],
        ['terms_and_condition_info'],
        lang,
      );
    return translatedTermAndCondition;
  }
  async setReminderTone(
    userId: string,
    reminderToneId: string,
  ): Promise<UserNotificationSettings> {
    const reminderTone = await this.userRepo.getReminderToneById(
      reminderToneId,
    );
    if (!reminderTone) {
      throw new NotFoundException(`users.reminder_not_found`);
    }
    const setReminderTone = await this.userRepo.setReminderTones(
      userId,
      reminderTone.title,
      reminderTone.file_name,
    );
    return setReminderTone;
  }

  async updateUserSecurityAndPrivacySetting(
    userId: string,
    input: UserSecurityAndPrivacySettingInput,
  ): Promise<UserSecurityAndPrivacySetting> {
    const userSecuritySetting =
      await this.userRepo.updateUserSecurityAndPrivacySetting(userId, input);
    return userSecuritySetting;
  }

  async getUserPrivacyAndSecuritySetting(
    userId: string,
  ): Promise<UserSecurityAndPrivacySetting> {
    const userPrivacy =
      await this.userRepo.getUserPrivacyAndSecuritySettingByUserId(userId);
    if (!userPrivacy) {
      throw new NotFoundException(`users.privacy_not_found`);
    }
    return userPrivacy;
  }

  async blockUser(userId: string, args: BlockUsertDto): Promise<BlockedUsers> {
    const { blockedUserId, block } = args;
    const [user, blockedUser] = await Promise.all([
      this.userRepo.getUserById(userId),
      this.userRepo.getUserById(blockedUserId),
    ]);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    if (!blockedUser) {
      throw new NotFoundException(`users.blocked_user_not_found`);
    }
    const blockedUserExist = await this.userRepo.getBlockedUser(
      userId,
      blockedUserId,
    );
    if (!blockedUserExist && block) {
      const blockedUserNew = await this.userRepo.addBlockedUser(
        userId,
        blockedUserId,
      );
      return blockedUserNew;
    }
    if (blockedUserExist && block) {
      throw new BadRequestException(`users.already_blocked_user`);
    }

    if (!blockedUserExist && !block) {
      throw new BadRequestException(`users.already_unblocked_user`);
    }
    const removeBlockedUser = await this.userRepo.removeBlockedUser(
      userId,
      blockedUserId,
    );
    return removeBlockedUser;
  }

  async updateFollowUser(
    userId: string,
    args: UserFollowtDto,
  ): Promise<UserFriend> {
    const { friendId, follow } = args;
    const [user, friend] = await Promise.all([
      this.userRepo.getUserById(userId),
      this.userRepo.getUserById(friendId),
    ]);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    if (!friend) {
      throw new NotFoundException(`users.friend_not_found`);
    }

    const friendExist = await this.userRepo.getFriendById(userId, friendId);

    if (friendExist && follow) {
      throw new BadRequestException(`users.already_followed_friend`);
    }

    if (!friendExist && !follow) {
      throw new BadRequestException(`users.already_unfollowed_friend`);
    }

    if (!friendExist && follow) {
      const newFriend = await this.userRepo.addFriend(userId, friendId);
      if (!newFriend) {
        throw new BadRequestException(`users.failed_add_new-friend`);
      }
      this.eventEmitter.emit(
        UserEvent.FRIEND_FOLLOWED,
        new FriendFollowedEvent(newFriend),
      );
      return newFriend;
    }

    const removeFriend = await this.userRepo.removeFriend(userId, friendId);
    if (!removeFriend) {
      throw new BadRequestException(`users.failed_remove_friend`);
    }
    return removeFriend;
  }

  async updateAvatarImageName(
    userId: string,
    avatarImageName: string,
  ): Promise<Users> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const [avatarName] = await Promise.all([
      this.userRepo.updateAvatarImageName(userId, avatarImageName),
      this.userRepo.updateOnboardingScreen(userId, OnboardingScreen.goals),
    ]);
    return avatarName;
  }

  async getSafeguardingInfo(): Promise<SafeGuarding> {
    const safeguarding = await this.userRepo.getSafeguardingInfo();
    if (!safeguarding) {
      throw new NotFoundException(`users.safe_guard_not_found`);
    }
    return safeguarding;
  }

  async getAdvocacyInfo(): Promise<Advocacy> {
    const advocacy = await this.userRepo.getAdvocacyInfo();
    if (!advocacy) {
      throw new NotFoundException(`users.advocacy_info_not_found`);
    }
    return advocacy;
  }

  async getAccountInformation(
    userId: string,
  ): Promise<GetAccountInformationResponse> {
    const [user, userTreatment] = await Promise.all([
      this.userRepo.getUserByIdNew(userId),
      this.userRepo.getUserTreatment(userId),
    ]);
    if (!user) {
      throw new NotFoundException(`users.user_info_not_found`);
    }

    const treatment_id = userTreatment?.treatment_id;
    return { user, treatment_id };
  }

  async getSupportVideoDetail(videoId: string): Promise<SupportVideosDetail> {
    const supportVideoDetail = await this.userRepo.getSupportVideoDetail(
      videoId,
    );
    if (!supportVideoDetail) {
      throw new NotFoundException(`users.support_video_detail_not_found`);
    }
    return supportVideoDetail;
  }

  async getPrivacyPolicy(lang: string): Promise<PrivacyPolicy> {
    const privacyPolicy = await this.userRepo.getPrivacyPolicy();
    if (!privacyPolicy) {
      throw new NotFoundException(`users.policy_not_found`);
    }
    const [translatedPrivacyPolicy] =
      this.translationService.getTranslations<PrivacyPolicy>(
        [privacyPolicy],
        ['privacy_policy_info'],
        lang,
      );
    return translatedPrivacyPolicy;
  }
  async changeAdminOrEditorPassword(
    args: ChangeAdminOrEditorPasswordArgs,
    id: string,
    role: UserRoles,
  ): Promise<CommonResponseMessage> {
    try {
      const { newPassword, oldPassword } = args;
      let user;
      if (role == UserRoles.ADMIN) {
        user = await this.userRepo.getUserById(id);
      } else {
        user = await this.contentEditorsRepo.getEditorById(id);
      }

      const isPasswordValid = this.authService.compareHash(
        oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException(`users.incorrect_old_password`);
      }
      const passwordHash = this.authService.hashPassword(newPassword);
      if (role == UserRoles.ADMIN) {
        await this.userRepo.updateUserById(user.id, {
          password: passwordHash,
          forgot_password_token: null,
        });
      } else {
        await this.contentEditorsRepo.updateEditorPassword(
          user.id,
          passwordHash,
        );
      }

      return {
        message: this.translationService.translate(`users.password_updated`),
      };
    } catch (error) {
      return { message: error.message };
    }
  }

  public async getHabitToolEndDate(
    query: HabitToolEndDateArgs,
  ): Promise<HabitToolEndDateOutput> {
    const toolkit = await this.userRepo.getHabitToolEndDate(query.tool_kit_id);

    if (!toolkit) {
      throw new NotFoundException(`users.tool_kit_info_not_found`);
    }

    if (toolkit.tool_kit_type !== ToolkitType.HABIT) {
      throw new NotFoundException(`users.habit_tool_kit_not_found`);
    }

    if (!toolkit.habit_duration) {
      throw new NotFoundException(`users.habit_duration_not_found`);
    }
    const habitDuration = toolkit.habit_duration as number;

    const endDate = datefns.addDays(
      new Date(query.current_date),
      habitDuration,
    );

    return { endDate };
  }

  async deleteUser(args: DeleteUserArgs): Promise<DeleteUserResponse> {
    const { id, remove } = args;
    const user = await this.userRepo.getUserById(id);
    if (!user) {
      throw new BadRequestException(`users.user_not_found`);
    }
    const action = remove ? 'deleted' : 'actived';
    if (user.is_deleted !== null && user.is_deleted === remove) {
      throw new BadRequestException(`user.user_already ${action}`);
    }
    const updates: Partial<User> = { is_deleted: remove };
    if (remove) {
      updates['refresh_token'] = null;
      await Promise.all([
        this.authService.blockUser(id),
        this.userRepo.disableUserSchedules(id),
      ]);
    } else {
      await this.authService.unBlockUser(id);
    }
    await this.userRepo.updateUserById(id, updates);

    return {
      message: `User ${action}`,
    };
  }

  async getUserScoreNew(
    userId: string,
    lang?: string,
  ): Promise<GetUserScoreResponse> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const myBalance = await this.rewardsService.getUserBalance(userId);
    const [trophies, membershipLevels, membershipStages, { bonuses }] =
      await Promise.all([
        this.trophiesService.getUserTrophiesSummary(userId, lang),
        this.membershipLevelsService.getUserMembershipLevelSummary({
          userId: user.id,
          points: myBalance.earned,
          lang,
        }),
        this.membershipStagesService.getUserMembershipStagesSummary({
          userId: user.id,
          points: myBalance.earned,
          lang,
        }),
        this.bonusesService.getBonusesNew(userId),
      ]);
    const bonusesCount = bonuses.filter(
      (bonus) => bonus.can_claim && !bonus.is_claimed,
    ).length;
    const response: GetUserScoreResponse = {
      my_balance: { ...myBalance, total: user.hlp_reward_points_balance },
      membership_levels: membershipLevels,
      membership_stages: membershipStages,
      trophies,
      bonuses: bonusesCount,
    };
    return response;
  }

  async getUserProfileInfo(
    userId: string,
    lang?: string,
  ): Promise<GetProfileInfoResponse> {
    const [userInfo, favouritePost, userPost] = await Promise.all([
      this.userRepo.getUserInfo(userId),
      this.userRepo.getFavouritePosts(userId),
      this.userRepo.getUserPosts(userId),
    ]);

    if (!userInfo) {
      throw new NotFoundException(`users.user_profile_not_found`);
    }
    const userTrophies = userInfo.user_trophies || [];
    const translatedTrophies = await Promise.all(
      userTrophies.map((trophy) => {
        const [translatedTrophy] =
          this.translationService.getTranslations<Trophy>(
            [trophy],
            ['title', 'short_description'],
            lang,
          );
        return {
          ...trophy,
          title: translatedTrophy.title,
          short_description: translatedTrophy.short_description,
        };
      }),
    );
    userInfo.user_trophies = translatedTrophies;

    return {
      userInfo,
      favouritePosts: favouritePost,
      userPosts: userPost,
    };
  }

  async validateOrganisation(organisationId: string): Promise<void> {
    const organisation = await this.userRepo.getOrganisation(organisationId);

    if (!organisation) {
      throw new BadRequestException(`organisation.invalid_organisation`);
    }
  }

  getUserAgeGroup(dateOfBirth: string): AgeGroups {
    dateOfBirth = this.utilsService.getISODateString(new Date(dateOfBirth));

    const age = this.utilsService.getDifferenceInYears(dateOfBirth);

    if (age < 6) {
      throw new BadRequestException(`users.invalid_age`);
    } else if (age >= 6 && age <= 17) {
      return AgeGroups.child;
    } else if (age > 17 && age < 65) {
      return AgeGroups.adult;
    } else {
      return AgeGroups.elder;
    }
  }

  async registerUser(input: RegisterUserInput): Promise<UserSignupResponse> {
    const { email, password } = input;
    const role = UserRoles.USER;

    const [user, oauthUser, invitation] = await Promise.all([
      this.userRepo.getUserByEmail(email),
      this.userRepo.getOauthUserByEmailAndStatus(
        email,
        UserRegistrationStatus.PENDING,
      ),
      this.userRepo.getPatientInvitation(email),
    ]);

    if (user) {
      throw new BadRequestException(`users.email_already_exists`);
    }

    if (!oauthUser) {
      throw new BadRequestException(`users.invalid_email`);
    }

    const { organisation_id, display_name, gender } = oauthUser;

    await this.validateOrganisation(organisation_id);

    const birthDate = oauthUser.birth_date || '2000-01-01'; //Default date of birth
    const ageGroup = this.getUserAgeGroup(birthDate);
    const fullName = display_name ? display_name.replace(',', ' ') : null;

    const userInput: SaveUserInput = {
      email,
      password,
      role,
      gender,
      age_group: ageGroup,
      last_login_time: new Date(),
      accepted_terms_and_conditions: true,
      full_name: fullName,
      first_name: fullName,
      date_of_birth: birthDate,
      organization_id: organisation_id,
      oauth_user_id: oauthUser.id,
    };

    if (invitation) {
      userInput.invitation_id = invitation.id;
    }

    const tokens = await this.saveUserAndGenerateTokens(userInput);

    const userStatusInfoInput: AddUserStatusInfo = {
      user_id: tokens.id,
      status: UserStatus.OFFLINE,
      status_changed_by: UserStatusChangedBy.SERVER,
    };

    await Promise.all([
      this.userRepo.saveUserNotificationSettings(tokens.id),
      this.userRepo.saveUserSecurityAndPrivacySettings(tokens.id),
      this.userRepo.saveUserOnboarding(tokens.id),
      this.userRepo.saveUserStatusInfo(userStatusInfoInput),
      this.userRepo.updateOauthUserRegistrationStatus(
        oauthUser.id,
        UserRegistrationStatus.REGISTERED,
      ),
    ]);
    return tokens;
  }

  async getUserAnonymousStatus(
    loggedInUserId: string,
    id: string,
  ): Promise<GetUserAnonymousStatusResponse> {
    const user = await this.userRepo.getUserById(id);

    if (!user) {
      throw new BadRequestException(`users.user_not_found`);
    }
    let is_profile_anonymous = false;

    if (user.id !== loggedInUserId) {
      const userPrivacySettings =
        await this.userRepo.getUserPrivacyAndSecuritySettingByUserId(id);
      if (!userPrivacySettings) {
        throw new NotFoundException(`users.privacy_not_found`);
      }
      is_profile_anonymous = userPrivacySettings.is_profile_anonymous;
    }

    return {
      is_profile_anonymous,
    };
  }

  async getMyTools(
    args: GetMyToolsArgs,
    userId: string,
  ): Promise<GetMyToolsResponse> {
    const { toolkits: data, total } = await this.userRepo.getMyTools(
      args,
      userId,
    );

    const hasMore = args.page * args.limit < total;
    const toolkits = this.translationService.getTranslations<Toolkit>(data, [
      'title',
      'description',
      'tool_kit_info',
      'tool_type_text',
      'tool_description',
      'short_description',
      'extra_information_title',
      'todo_screen_description',
      'extra_information_description',
    ]);

    return {
      has_more: hasMore,
      toolkits,
    };
  }

  async sendUserFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<SendUserFriendRequestResponse> {
    const [user, friend, friendExist, userFriendRequest] = await Promise.all([
      this.userRepo.getUserById(userId),
      this.userRepo.getUserById(friendId),
      this.userRepo.getFriendById(userId, friendId),
      this.userRepo.getUserFriendRequest(userId, friendId),
    ]);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    if (!friend) {
      throw new NotFoundException(`users.friend_not_found`);
    }
    if (friendExist) {
      throw new BadRequestException(`users.user_already_friend`);
    }
    if (userFriendRequest) {
      throw new BadRequestException(`users.friend_request_already_sent`);
    }
    const inputData: InsertUserFriendRequest = {
      sender_id: userId,
      receiver_id: friendId,
    };
    const savedUserFriendRequest = await this.userRepo.saveUserFriendRequest(
      inputData,
    );
    this.eventEmitter.emit(
      UserEvent.FRIEND_REQUEST_CREATED,
      new FriendRequestCreatedEvent(savedUserFriendRequest),
    );
    return {
      message: this.translationService.translate(`users.friend_request_sent`),
      user_friend_request: savedUserFriendRequest,
    };
  }

  async resendUserFriendRequest(
    requestId: string,
  ): Promise<ResendUserFriendRequestResponse> {
    const userFriendRequest = await this.userRepo.getUserFriendRequestById(
      requestId,
    );
    if (!userFriendRequest) {
      throw new NotFoundException(`users.friend_request_not_found`);
    }
    this.eventEmitter.emit(
      UserEvent.FRIEND_REQUEST_CREATED,
      new FriendRequestCreatedEvent(userFriendRequest),
    );
    return {
      message: this.translationService.translate(`users.friend_request_sent`),
      user_friend_request: userFriendRequest,
    };
  }

  async updateUserFriendRequestStatus(
    input: UpdateFriendRequestStatusInput,
  ): Promise<UpdateFriendRequestStatusResponse> {
    const { requestId, status } = input;
    const userFriendRequest = await this.userRepo.getUserFriendRequestById(
      requestId,
    );
    if (!userFriendRequest) {
      throw new NotFoundException(`users.friend_request_not_found`);
    }
    const { receiver_id: friendId, sender_id: userId } = userFriendRequest;

    await Promise.all([
      this.userRepo.updateUserFriendRequestStatus(requestId, status),
      this.userRepo.updateUserNotification(requestId),
    ]);

    if (status === ChannelInvitationStatus.ACCEPTED) {
      const savedFriend = await this.userRepo.addFriend(userId, friendId);
      this.eventEmitter.emit(
        UserEvent.FRIEND_FOLLOWED,
        new FriendFollowedEvent(savedFriend),
      );
    }
    return {
      message: this.translationService.translate(`users.status_updated`),
    };
  }

  async removeUserFriendRequest(
    requestId: string,
  ): Promise<RemoveUserFriendRequestResponse> {
    const userFriendRequest = await this.userRepo.getUserFriendRequestById(
      requestId,
    );
    if (!userFriendRequest) {
      throw new NotFoundException(`users.friend_request_not_found`);
    }

    await Promise.all([
      this.userRepo.removeUserFriendRequest(requestId),
      this.userRepo.updateUserNotification(requestId),
    ]);
    return {
      message: `${this.translationService.translate(
        'users.friend_request_removed_successfully',
      )}`,
    };
  }

  async getUserFriendRequests(
    userId: string,
    args: PaginationArgs,
  ): Promise<GetUserFriendRequestsResponse> {
    const { page, limit } = args;
    const { friendRequests, total } = await this.userRepo.getUserFriendRequests(
      userId,
      page,
      limit,
    );
    const hasMore = args.page * args.limit < total;
    return {
      hasMore: hasMore,
      friendRequestCount: total,
      userFriendRequests: friendRequests,
    };
  }

  async removeUserFriend(
    userId: string,
    friendId: string,
  ): Promise<RemoveUserFriendResponse> {
    const friend = await this.userRepo.getFriendById(userId, friendId);
    if (!friend) {
      throw new NotFoundException(`users.friend_not_found`);
    }
    await this.userRepo.removeFriend(userId, friendId);
    return {
      message: this.translationService.translate(`users.remove_friend`),
    };
  }

  async getFriends(
    userId: string,
    args: GetFriendsArgs,
  ): Promise<GetFriendsResponse> {
    const { page, limit, search } = args;
    const { friends, total } = await this.userRepo.getFriends(
      userId,
      page,
      limit,
      search,
    );
    const hasMore = args.page * args.limit < total;
    return {
      friends,
      hasMore: hasMore,
    };
  }

  async isUserActive(userId: string): Promise<boolean> {
    const key = this.redisService.getActiveUsersKey();
    const data = await this.redisService.hget(key, userId);
    return data !== null;
  }

  async updateUserActiveStatus(
    server: Server,
    userId: string,
    isActive: boolean,
  ): Promise<void> {
    const key = this.redisService.getActiveUsersKey();
    if (isActive) {
      await this.redisService.hset(key, [userId, userId]);
    }
    if (!isActive) {
      await this.redisService.hdel(key, userId);
    }

    server.emit(WEBSOCKET_CLIENT_EVENT.USERS_STATUS_UPDATES(userId), {
      isActive,
    });
  }

  async verifyUserLoginOtp(
    args: VerifyUserLoginOtpArgs,
  ): Promise<VerifyUserLoginResponse> {
    const { code, token } = args;

    const { error, data } = await this.authService.verifyTempAccessToken(token);
    if (error) {
      throw new UnauthorizedException(`users.expired_token`);
    }

    const user = await this.userRepo.getUserByIdNew(data.id);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }

    const { email_verification_code, id } = user;
    if (!email_verification_code) {
      throw new UnauthorizedException(`users.invalid_code`);
    }

    const isValidCode =
      totp.verify({ token: code, secret: id }) &&
      email_verification_code === code;

    if (!isValidCode) {
      throw new UnauthorizedException(`users.incorrect_verification_code`);
    }

    const testUser = this.configService.get(EnvVariable.TEST_USER_EMAIL);
    const isTestUser = testUser === user.email;
    const expiration = isTestUser ? 100 : undefined;
    const tokens = await this.authService.getTokens(user, expiration);

    const [, onboarding, securitySettings] = await Promise.all([
      this.userRepo.updateUserById(user.id, {
        refresh_token: tokens.refresh_token,
        email_verification_code: null,
      }),
      this.userRepo.getOnboardingByUserId(user.id),
      this.userRepo.getUserPrivacyAndSecuritySettingByUserId(user.id),
    ]);

    if (user.role == UserRoles.USER) {
      await this.pukQueue.LogActivity(user);
    }

    const userSecuritySettings: UserSecuritySetting = {
      app_lock_enabled: securitySettings?.app_lock_enabled || false,
      otp_login_enabled: securitySettings?.otp_login_enabled || false,
    };

    return { ...tokens, onboarding, userSecuritySettings };
  }

  async resendUserLoginOtp(token: string): Promise<ResendUserLoginOtpResponse> {
    const { error, data } = await this.authService.verifyTempAccessToken(token);
    if (error) {
      throw new UnauthorizedException(`users.expired_token`);
    }
    const user = await this.userRepo.getUserByIdNew(data.id);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }

    const code = this.getEmailVerificationCode(user.id);
    await this.userRepo.updateUserById(user.id, {
      email_verification_code: code,
      refresh_token: null,
    });
    await this.emailsService.sendUserOTPLoginEmail(user.id, code);

    return {
      message: this.translationService.translate('users.otp_send_successfully'),
    };
  }

  async updateAvatar(
    updateAvatarInput: UpdateAvatarInput,
    userId: string,
    isOnboarded: boolean,
  ): Promise<UpdateAvatarResponse> {
    const { avatar_type, avatar_image_name, image } = updateAvatarInput;

    if (avatar_type === AvatarType.EMOJI && !avatar_image_name) {
      throw new NotFoundException(`users.avatar_name_required`);
    }
    if (avatar_type === AvatarType.IMAGE && !image) {
      throw new NotFoundException(`users.image_name_required`);
    }

    if (avatar_type !== AvatarType.EMOJI && avatar_image_name) {
      throw new BadRequestException(`users.avatar_name_not_required`);
    }
    if (avatar_type !== AvatarType.IMAGE && image) {
      throw new NotFoundException(`users.image_name_not_required`);
    }

    const updates: UpdateUserDto = { avatar_type: avatar_type };

    if (avatar_type === AvatarType.EMOJI && avatar_image_name) {
      updates.avatar_image_name = avatar_image_name;
    }

    if (avatar_type === AvatarType.IMAGE && image) {
      updates.image_url = image.image_url;
      updates.image_id = image.image_id;
      updates.file_path = image.file_path;
    }

    const promises: [Promise<Users>, Promise<Onboarding | undefined>?] = [
      this.userRepo.updateUserById(userId, updates),
    ];

    if (!isOnboarded) {
      const updateOnboardingScreenRequest =
        this.userRepo.updateOnboardingScreen(userId, OnboardingScreen.goals);
      promises.push(updateOnboardingScreenRequest);
    }

    const [updatedUser] = await Promise.all(promises);

    return {
      updatedUser: updatedUser,
    };
  }

  async addOrUpdateUserToMailchimpList(
    userId: string,
  ): Promise<AddOrUpdateUserToMailchimpListResponse> {
    const userWithOrganisation = await this.userRepo.getUserWithOrganisation(
      userId,
    );

    if (!userWithOrganisation) {
      return { message: `User Not Found` };
    }
    const { organisation, ...user } = userWithOrganisation;

    if (!organisation) {
      return { message: `Organisation Not Found` };
    }

    const [translateOrganisation] =
      this.translationService.getTranslations<Organisation>(
        [organisation],
        ['name'],
      );

    const mailchimpListMemberBody: MailchimpListMemberBody = {
      email_address: user.email,
      status: MailchimpListMemberStatus.SUBSCRIBED,
      merge_fields: {
        FNAME: user.first_name || user.user_name,
        LNAME: user.last_name || ' ',
        ACCGROUP: user.age_group,
        GENDER: user.gender || ' ',
        ROLE: user.role,
        PACKAGE: 'Standard',
        ORG: translateOrganisation.name,
      },
    };

    return await this.mailchimpService.addOrUpdateUserToMailchimpList(
      mailchimpListMemberBody,
    );
  }

  async updateUser(input: UpdateUserInput): Promise<UpdateUserResponse> {
    const { user_id: userId, user_input: userInput } = input;
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }

    await this.userRepo.updateUser(userId, userInput);
    return {
      message: this.translationService.translate(
        'users.user_updated_successfully',
      ),
    };
  }

  async changeUserPassword(
    input: ChangeUserPasswordInput,
  ): Promise<ChangedPasswordResponse> {
    const { id, password } = input;
    const user = await this.userRepo.getUserByIdAndRole(id);
    if (!user) {
      throw new BadRequestException(`users.user_not_found`);
    }

    const passwordHash = this.authService.hashPassword(password);
    await this.userRepo.updateUser(user.id, {
      password: passwordHash,
    });

    return {
      message: this.translationService.translate(`users.user_password_updated`),
    };
  }

  async deleteUserAccount(userId: string): Promise<DeleteUserResponse> {
    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`users.user_not_found`);
    }
    if (user.is_deleted) {
      throw new BadRequestException(`users.user_already_deleted`);
    }
    await Promise.all([
      this.userRepo.updateUser(userId, {
        is_deleted: true,
      }),
      this.userRepo.disableUserSchedules(userId),
    ]);
    return {
      message: this.translationService.translate(
        `users.account_deleted_successfully`,
      ),
    };
  }
}
