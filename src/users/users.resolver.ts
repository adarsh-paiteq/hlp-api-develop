import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserNotificationSettings, UserRoles } from '../users/users.dto';
import { BlockedUserList, BlockUsertDto } from './dto/blocked-user.dto';
import {
  UpdateAvatarNameArgs,
  UpdateFullNameArgs,
  UserFollowtDto,
  UserQueryInput,
} from './dto/users.dto';
import { VerifyVerificationCodeArgsDto } from './dto/verify-verification-code.dto';
import { AboutUs } from './entities/about-us.entity';
import { BlockedUsers } from './entities/blocked-users.entity';
import { TermAndCondition } from './entities/terms-and-conditions.entity';
import { UserFriend } from './entities/user-friend.entity';
import { UserQuery } from './entities/user-queries.entity';
import { UserSecurityAndPrivacySetting } from './entities/user-security-and-privacy-settings.entity';
import {
  CommonResponseMessage,
  OnboardingStatus,
  RefreshTokenArgs,
  RefreshTokenResponse,
  ForgetPasswordArgs,
  UserDonationArgs,
  Users,
  UserSignupArgs,
  UserSignupResponse,
  CheckEmailResponse,
  CheckEmailArgs,
  ChangePasswordArgs,
  ChangePinArgs,
  VerifyEmailArgs,
  SendVerificationEmailArgs,
  SendForgetPinEmailArgs,
  AddPinArgs,
  CheckPinArgs,
  CheckPinResponse,
  GetHelpedUsersResponse,
  GetUserFriendsResponse,
  GetUserFriendsArgs,
  GetHelpedUsersArgs,
  ChangeAdminOrEditorPasswordArgs,
  UpdateUserNameArgs,
} from './users.model';
import { UsersService } from './users.service';
import { SafeGuarding } from './entities/safeguarding.entity';
import { Advocacy } from './entities/advocacy.entity';
import {
  SupportVideoCategory,
  SupportVideoDetailsArgs,
  SupportVideosDetail,
} from './dto/get-support-video.dto';
import { UserSecurityAndPrivacySettingInput } from './dto/user-security-privacy-setting.dto';
import { PrivacyPolicy } from './entities/privacy-policy.entity';
import { SetReminderToneArgs } from './dto/set-reminder-tone.dto';
import {
  HabitToolEndDateArgs,
  HabitToolEndDateOutput,
} from './dto/habit-tool-end-date.dto';
import {
  PurchaseShopItemInput,
  PurchaseShopItemResponse,
} from './dto/purchase-shop-item.dto';
import {
  GetShopItemPriceAndHLPPointsArgs,
  ShopItemPriceAndHLPPointsOutput,
} from './dto/get-shop-item-price-and-hlp-points.dto';
import {
  GetExtraInformationArgs,
  GetExtraInformationResponse,
} from './dto/get-extra-information.dto';
import { DeleteUserArgs, DeleteUserResponse } from './dto/delete-user.dto';
import { GetUserScoreResponse } from './dto/get-user-score.dto';
import { GetProfileInfoResponse } from './dto/get-user-profile.dto';
import {
  RegisterUserInput,
  RegisterUserResponse,
} from './dto/register-user.dto';
import {
  GetUserAnonymousStatusArgs,
  GetUserAnonymousStatusResponse,
} from './dto/get-user-anonymous-status.dto';
import { GetMyToolsArgs, GetMyToolsResponse } from './dto/get-my-tools.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import {
  SendUserFriendRequestArgs,
  SendUserFriendRequestResponse,
} from './dto/send-friend-request.dto';
import {
  ResendUserFriendRequestArgs,
  ResendUserFriendRequestResponse,
} from './dto/resend-friend-request.dto';
import {
  UpdateFriendRequestStatusInput,
  UpdateFriendRequestStatusResponse,
} from './dto/update-user-friend-request-status.dto';
import {
  RemoveUserFriendRequestArgs,
  RemoveUserFriendRequestResponse,
} from './dto/remove-user-friend-request.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetUserFriendRequestsResponse } from './dto/user-friend-request-list.dto';
import {
  RemoveUserFriendArgs,
  RemoveUserFriendResponse,
} from './dto/remove-friend.dto';
import { GetFriendsArgs, GetFriendsResponse } from './dto/get-user-friends.dto';
import {
  VerifyUserLoginOtpArgs,
  VerifyUserLoginResponse,
} from './dto/verify-user-login-otp.dto';
import {
  ResendUserLoginOtpArgs,
  ResendUserLoginOtpResponse,
} from './dto/resend-user-login-otp.dto';
import { LoginArgs, LoginResponse } from './dto/login-user-account.dto';
import { GetAccountInformationResponse } from './dto/get-account-information.dto';
import {
  UpdateAvatarInput,
  UpdateAvatarResponse,
} from './dto/update-avatar-image.dto';
import {
  ChangeUserPasswordInput,
  ChangedPasswordResponse,
} from './dto/change-user-password.dto';
import { UpdateUserInput, UpdateUserResponse } from './dto/update-user.dto';
import {
  UpdateUsernameArgs,
  UpdateUsernameResponse,
} from './dto/update-username.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => Users, { name: 'donateHlpPoints' })
  async donateHlpPoints(
    @GetUser() user: LoggedInUser,
    @Args() args: UserDonationArgs,
  ): Promise<Users> {
    return this.usersService.donateHlpPoints(args, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetHelpedUsersResponse, { name: 'getHelpedUsers' })
  async getHelpedUsers(
    @Args() args: GetHelpedUsersArgs,
  ): Promise<GetHelpedUsersResponse> {
    return this.usersService.getHelpedUsers(args.userId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserFriendsResponse, { name: 'getFriendsList' })
  async getUseFriendsList(
    @Args() args: GetUserFriendsArgs,
  ): Promise<GetUserFriendsResponse> {
    return this.usersService.getFriendsList(args.userId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => OnboardingStatus)
  async getOnboarding(
    @GetUser() user: LoggedInUser,
  ): Promise<OnboardingStatus> {
    return this.usersService.getUserOnboarding(user.id);
  }

  @Mutation(() => LoginResponse, { name: 'loginAccount' })
  async loginAccount(@Args() args: LoginArgs): Promise<LoginResponse> {
    return this.usersService.login(args);
  }

  @Mutation(() => UserSignupResponse, { name: 'userSignup' })
  async userSignup(@Args() args: UserSignupArgs): Promise<UserSignupResponse> {
    return this.usersService.userSignup(args);
  }

  @Mutation(() => RefreshTokenResponse, { name: 'refreshToken' })
  async refreshToken(
    @Args() args: RefreshTokenArgs,
  ): Promise<RefreshTokenResponse> {
    return this.usersService.refreshToken(args.token);
  }

  @Mutation(() => CommonResponseMessage, { name: 'forgotPassword' })
  async forgotPassword(
    @Args() args: ForgetPasswordArgs,
  ): Promise<CommonResponseMessage> {
    return this.usersService.forgotPassword(args.email);
  }

  @Mutation(() => CheckEmailResponse, { name: 'checkEmail' })
  async checkEmail(@Args() args: CheckEmailArgs): Promise<CheckEmailResponse> {
    return this.usersService.checkEmail(args);
  }

  @Mutation(() => CommonResponseMessage, { name: 'changePassword' })
  async changePassword(
    @Args() args: ChangePasswordArgs,
  ): Promise<CommonResponseMessage> {
    return this.usersService.changePassword(args);
  }

  /**@deprecated migrated to updateUsername  */
  @Mutation(() => Users, { name: 'updateScreenName' })
  async updateUserName(@Args() args: UpdateUserNameArgs): Promise<Users> {
    return this.usersService.updateUserName(args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateUsernameResponse, { name: 'updateUsername' })
  async updateUsername(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateUsernameArgs,
  ): Promise<UpdateUsernameResponse> {
    return await this.usersService.updateUsername(
      user.id,
      user.role,
      args.user_name,
    );
  }

  @Mutation(() => CommonResponseMessage, { name: 'changePin' })
  async changePin(@Args() args: ChangePinArgs): Promise<CommonResponseMessage> {
    return this.usersService.changePin(args);
  }

  @Mutation(() => CommonResponseMessage, { name: 'verifyEmail' })
  async verifyEmail(
    @Args() args: VerifyEmailArgs,
  ): Promise<CommonResponseMessage> {
    return this.usersService.verifyEmail(args);
  }

  @Mutation(() => CommonResponseMessage, { name: 'sendVerificationEmail' })
  async sendVerificationEmail(
    @Args() args: SendVerificationEmailArgs,
  ): Promise<CommonResponseMessage> {
    return this.usersService.sendVerificationEmail(args.user_id);
  }

  @Mutation(() => CommonResponseMessage, { name: 'sendForgotPinEmail' })
  async sendForgotPinEmail(
    @Args() args: SendForgetPinEmailArgs,
  ): Promise<CommonResponseMessage> {
    return this.usersService.sendForgotPinEmail(args.email);
  }

  @Mutation(() => CommonResponseMessage, { name: 'addPin' })
  async addPin(@Args() args: AddPinArgs): Promise<CommonResponseMessage> {
    return this.usersService.addPin(args.user_id, args.pin);
  }

  @Mutation(() => CheckPinResponse, { name: 'checkPin' })
  async checkPin(@Args() args: CheckPinArgs): Promise<CheckPinResponse> {
    return this.usersService.checkPin(args.user_id, args.pin);
  }

  //   @Throttle(6, 10)
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CommonResponseMessage, { name: 'sendVerificationCode' })
  async sendVerificationCode(
    @GetUser() user: LoggedInUser,
  ): Promise<CommonResponseMessage> {
    return this.usersService.sendVerificationCode(user.id);
  }

  //   @Throttle(6, 10)
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CommonResponseMessage, { name: 'verifyVerificationCode' })
  async verifyVerificationCode(
    @GetUser() user: LoggedInUser,
    @Args() args: VerifyVerificationCodeArgsDto,
  ): Promise<CommonResponseMessage> {
    return this.usersService.verifyVerificationCode(user.id, args.code);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [BlockedUserList], {
    name: 'getBlockedUserList',
  })
  async getBlockedUserList(
    @GetUser() user: LoggedInUser,
  ): Promise<BlockedUserList[]> {
    return this.usersService.getBlockedUserList(user.id);
  }
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => Users, {
    name: 'updateFullName',
  })
  async updateFullName(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateFullNameArgs,
  ): Promise<Users> {
    return this.usersService.updateFullName(user.id, args.fullName);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserQuery, {
    name: 'addUserQuery',
  })
  async addUserQuery(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UserQueryInput,
  ): Promise<UserQuery> {
    return this.usersService.addUserQuery(user.id, input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [SupportVideoCategory], { name: 'getSupportVideoCategory' })
  async getSupportVideoInfo(
    @I18nNextLanguage() lang: string,
  ): Promise<SupportVideoCategory[]> {
    return this.usersService.getSupportVideoInfo(lang);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => AboutUs, { name: 'getAboutUs' })
  async getAboutUs(@I18nNextLanguage() lang: string): Promise<AboutUs> {
    return this.usersService.getAboutUs(lang);
  }

  @Query(() => TermAndCondition, { name: 'getTermsAndCondition' })
  async getTermsAndConditions(
    @I18nNextLanguage() lang: string,
  ): Promise<TermAndCondition> {
    return this.usersService.getTermsAndConditions(lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserSecurityAndPrivacySetting, {
    name: 'updateUserSecurityAndPrivacySetting',
  })
  async updateUserSecurityAndPrivacySetting(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UserSecurityAndPrivacySettingInput,
  ): Promise<UserSecurityAndPrivacySetting> {
    return this.usersService.updateUserSecurityAndPrivacySetting(
      user.id,
      input,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserNotificationSettings, {
    name: 'setReminderTone',
  })
  async setReminderTone(
    @GetUser() user: LoggedInUser,
    @Args() args: SetReminderToneArgs,
  ): Promise<UserNotificationSettings> {
    return this.usersService.setReminderTone(user.id, args.reminderToneId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => UserSecurityAndPrivacySetting, {
    name: 'getUserSecurityAndPrivacySetting',
  })
  async getUserPrivacyAndSecuritySetting(
    @GetUser() user: LoggedInUser,
  ): Promise<UserSecurityAndPrivacySetting> {
    return this.usersService.getUserPrivacyAndSecuritySetting(user.id);
  }

  /**
   * @description to block and unBlock user
   */
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => BlockedUsers, {
    name: 'blockUser',
  })
  async blockUser(
    @GetUser() user: LoggedInUser,
    @Args() args: BlockUsertDto,
  ): Promise<BlockedUsers> {
    return this.usersService.blockUser(user.id, args);
  }

  /**
   * @description to follow and unFollow user
   */
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserFriend, {
    name: 'updateFollowUser',
    description: 'To follow and unfollow user',
  })
  async updateFollowUser(
    @GetUser() user: LoggedInUser,
    @Args() args: UserFollowtDto,
  ): Promise<UserFriend> {
    return this.usersService.updateFollowUser(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => Users, {
    name: 'updateAvatarImageName',
  })
  async updateAvatarImageName(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateAvatarNameArgs,
  ): Promise<Users> {
    return this.usersService.updateAvatarImageName(
      user.id,
      args.avatarImageName,
    );
  }

  @Query(() => SafeGuarding, { name: 'getSafeguardingInfo' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSafeguardingInfo(): Promise<SafeGuarding> {
    return this.usersService.getSafeguardingInfo();
  }

  @Query(() => Advocacy, { name: 'getAdvocacyInfo' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAdvocacyInfo(): Promise<Advocacy> {
    return this.usersService.getAdvocacyInfo();
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAccountInformationResponse, {
    name: 'getAccountInformation',
  })
  async getAccountInformation(
    @GetUser() user: LoggedInUser,
  ): Promise<GetAccountInformationResponse> {
    return this.usersService.getAccountInformation(user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => SupportVideosDetail, { name: 'getSupportVideoDetail' })
  async getSupportVideoDetail(
    @Args() args: SupportVideoDetailsArgs,
  ): Promise<SupportVideosDetail> {
    return this.usersService.getSupportVideoDetail(args.videoId);
  }

  @Query(() => PrivacyPolicy, { name: 'getPrivacyPolicy' })
  async getPrivacyPolicy(
    @I18nNextLanguage() lang: string,
  ): Promise<PrivacyPolicy> {
    return this.usersService.getPrivacyPolicy(lang);
  }
  @Roles(UserRoles.ADMIN, UserRoles.CONTENT_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CommonResponseMessage, {
    name: 'changeAdminOrEditorPassword',
  })
  async changeAdminOrEditorPassword(
    @GetUser() user: LoggedInUser,
    @Args() args: ChangeAdminOrEditorPasswordArgs,
  ): Promise<CommonResponseMessage> {
    return this.usersService.changeAdminOrEditorPassword(
      args,
      user.id,
      user.role,
    );
  }

  @Query(() => HabitToolEndDateOutput, {
    name: 'habitToolEndDate',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHabitToolEndDate(
    @Args() args: HabitToolEndDateArgs,
  ): Promise<HabitToolEndDateOutput> {
    return this.usersService.getHabitToolEndDate(args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserScoreResponse, {
    name: 'getUserScoreNew',
  })
  async getUserScore(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserScoreResponse> {
    return this.usersService.getUserScoreNew(user.id, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => PurchaseShopItemResponse, {
    name: 'userPurchaseShopItem',
  })
  async purchaseShopItem(
    @GetUser() user: LoggedInUser,
    @Args('input') input: PurchaseShopItemInput,
  ): Promise<PurchaseShopItemResponse> {
    return this.usersService.purchaseShopItem(user.id, input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ShopItemPriceAndHLPPointsOutput, {
    name: 'getUserShopItemPriceAndHLPPoints',
  })
  async getShopItemPriceAndHLPPoints(
    @GetUser() user: LoggedInUser,
    @Args() args: GetShopItemPriceAndHLPPointsArgs,
  ): Promise<ShopItemPriceAndHLPPointsOutput> {
    const query = { user_id: user.id, shop_item_id: args.shopItemId };
    return this.usersService.getShopItemPriceAndHLPPoints(query);
  }

  @Query(() => GetExtraInformationResponse, {
    name: 'getExtraInformation',
    description: `get extrainformation of tools`,
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getExtraInformation(
    @I18nNextLanguage() lang: string,
    @Args() args: GetExtraInformationArgs,
  ): Promise<GetExtraInformationResponse> {
    return this.usersService.getExtraInformation(args, lang);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteUserResponse, { name: 'deleteUser' })
  async deleteUser(@Args() args: DeleteUserArgs): Promise<DeleteUserResponse> {
    return this.usersService.deleteUser(args);
  }

  @Query(() => GetProfileInfoResponse, {
    name: 'getUserProfileInfo',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserProfileInfo(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetProfileInfoResponse> {
    return this.usersService.getUserProfileInfo(user.id, lang);
  }

  @Mutation(() => RegisterUserResponse, { name: 'registerUser' })
  async registerUser(
    @Args({ name: 'input' }) input: RegisterUserInput,
  ): Promise<UserSignupResponse> {
    return this.usersService.registerUser(input);
  }

  @Query(() => GetUserAnonymousStatusResponse, {
    name: 'getUserAnonymousStatus',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserAnonymousStatus(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserAnonymousStatusArgs,
  ): Promise<GetUserAnonymousStatusResponse> {
    return this.usersService.getUserAnonymousStatus(user.id, args.id);
  }

  @Query(() => GetMyToolsResponse, { name: 'getMyTools' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyTools(
    @GetUser() user: LoggedInUser,
    @Args() args: GetMyToolsArgs,
  ): Promise<GetMyToolsResponse> {
    return this.usersService.getMyTools(args, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SendUserFriendRequestResponse, {
    name: 'sendUserFriendRequest',
  })
  async sendUserFriendRequest(
    @GetUser() user: LoggedInUser,
    @Args() args: SendUserFriendRequestArgs,
  ): Promise<SendUserFriendRequestResponse> {
    return this.usersService.sendUserFriendRequest(user.id, args.friendId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ResendUserFriendRequestResponse, {
    name: 'resendUserFriendRequest',
  })
  async resendUserFriendRequest(
    @Args() args: ResendUserFriendRequestArgs,
  ): Promise<ResendUserFriendRequestResponse> {
    return this.usersService.resendUserFriendRequest(args.requestId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateFriendRequestStatusResponse, {
    name: 'updateUserFriendRequestStatus',
  })
  async updateUserFriendRequestStatus(
    @Args('input') input: UpdateFriendRequestStatusInput,
  ): Promise<UpdateFriendRequestStatusResponse> {
    return await this.usersService.updateUserFriendRequestStatus(input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => RemoveUserFriendRequestResponse, {
    name: 'removeUserFriendRequest',
  })
  async removeUserFriendRequest(
    @Args() args: RemoveUserFriendRequestArgs,
  ): Promise<RemoveUserFriendRequestResponse> {
    return await this.usersService.removeUserFriendRequest(args.requestId);
  }

  @Query(() => GetUserFriendRequestsResponse, {
    name: 'getUserFriendRequests',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserFriendRequests(
    @GetUser() user: LoggedInUser,
    @Args() args: PaginationArgs,
  ): Promise<GetUserFriendRequestsResponse> {
    return this.usersService.getUserFriendRequests(user.id, args);
  }

  @Mutation(() => RemoveUserFriendResponse, {
    name: 'removeUserFriend',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeUserFriend(
    @GetUser() user: LoggedInUser,
    @Args() args: RemoveUserFriendArgs,
  ): Promise<RemoveUserFriendResponse> {
    return this.usersService.removeUserFriend(user.id, args.friendId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetFriendsResponse, { name: 'getFriends' })
  async getFriends(
    @GetUser() user: LoggedInUser,
    @Args() args: GetFriendsArgs,
  ): Promise<GetFriendsResponse> {
    return await this.usersService.getFriends(user.id, args);
  }

  @Mutation(() => VerifyUserLoginResponse, { name: 'verifyUserLoginOtp' })
  async verifyUserLoginOtp(
    @Args() args: VerifyUserLoginOtpArgs,
  ): Promise<VerifyUserLoginResponse> {
    return await this.usersService.verifyUserLoginOtp(args);
  }

  @Mutation(() => ResendUserLoginOtpResponse, {
    name: 'resendUserLoginOtp',
  })
  async resendUserLoginOtp(
    @Args() args: ResendUserLoginOtpArgs,
  ): Promise<ResendUserLoginOtpResponse> {
    return await this.usersService.resendUserLoginOtp(args.token);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateAvatarResponse, {
    name: 'updateAvatar',
  })
  async updateAvatar(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UpdateAvatarInput,
  ): Promise<UpdateAvatarResponse> {
    return this.usersService.updateAvatar(input, user.id, user.is_onboarded);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateUserResponse, {
    name: 'updateUser',
  })
  async updateUser(
    @Args('input') input: UpdateUserInput,
  ): Promise<UpdateUserResponse> {
    return this.usersService.updateUser(input);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChangedPasswordResponse, { name: 'changeUserPassword' })
  async changeUserPassword(
    @Args('input') input: ChangeUserPasswordInput,
  ): Promise<ChangedPasswordResponse> {
    return this.usersService.changeUserPassword(input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteUserResponse, { name: 'deleteUserAccount' })
  async deleteUserAccount(
    @GetUser() user: LoggedInUser,
  ): Promise<DeleteUserResponse> {
    return await this.usersService.deleteUserAccount(user.id);
  }
}
