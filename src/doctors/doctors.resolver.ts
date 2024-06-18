import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { RegisterPasswordArgs } from './dto/register-password.dto';
import { DoctorResetPasswordArgs } from './dto/doctor-reset-password.dto';
import { DoctorForgetPasswordArgs } from './dto/doctor-forgot-password.dto';
import {
  CommonResponseMessage,
  RefreshTokenResponse,
  GenerateTokens,
} from '../users/users.model';
import { DoctorRefreshTokenArgs } from './dto/refresh-token.dto';
import { CheckDoctorPinArgs } from './dto/check-doctor-pin.dto';
import { DoctorLoginArgs, DoctorLoginResponse } from './dto/doctor-login.dto';
import { ResetDoctorPinArgs } from './dto/doctor-reset-pin.dto';
import { DoctorForgotPinArgs } from './dto/doctor-forgot-pin.dto';
import { SetDoctorScreenNameArgs } from './dto/set-doctor-screen-name.dto';
import { AddDoctorPinArgs } from './dto/add-doctor-pin.dto';
import { VerifyDoctorEmailArgs } from './dto/verify-doctor-email.dto';
import { SendDoctorVerificationEmailArgs } from './dto/send-verification-email.dto';
import {
  DoctorRegisterResponse,
  RegisterDoctorArgs,
} from './dto/register-doctor.dto';
import { SetDoctorProfilePictureArgs } from './dto/set-doctor-profile-picture.dto';
import { GetSearchUsersArgs, GetUserResponse } from './dto/search-users.dto';
import { Roles } from '@shared/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  DoctorPatientsListInput,
  DoctorPatientsListOutput,
} from './dto/doctor-patients-list.dto';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { GetUser } from '@shared/decorators/user.decorator';
import {
  GetDoctorListArgs,
  GetDoctorListResponse,
} from './dto/get-doctor-list.dto';
import { AddDoctorResponse, CreateDoctorInput } from './dto/add-doctor.dto';
import { GetDoctorArgs, GetDoctorResponse } from './dto/get-doctor.dto';
import {
  UpdateDoctorArgs,
  UpdateDoctorInput,
  UpdateDoctorResponse,
} from './dto/update-doctor.dto';
import { GetDoctorsResponse } from './dto/get-doctors.dto';
import {
  DeleteDoctorAccountArgs,
  DeleteDoctorAccountResponse,
} from './dto/delete-doctor-account.dto';
import {
  ChangeDoctorPinArgs,
  ChangeDoctorPinResponse,
} from './dto/change-doctor-pin.dto';

import {
  VerifyDoctorLoginOtpArgs,
  VerifyDoctorLoginResponse,
} from './dto/verify-doctor-login-otp.dto';
import { LogoutDoctorResponse } from './dto/logout-doctor.dto';
import { DoctorNotificationSettingResponse } from './dto/get-doctor-notification-settings.dto';
import {
  SendChangeDoctorEmailRequestArgs,
  SendChangeDoctorEmailRequestResponse,
} from './dto/send-change-doctor-email-request.dto';
import {
  VerifyChangeDoctorEmailArgs,
  VerifyChangeDoctorEmailResponse,
} from './dto/verify-change-doctor-email-request.dto';

import {
  ChangeDoctorPasswordArgs,
  ChangeDoctorPasswordResp,
} from './dto/change-password.dto';
import { DoctorSecurityAndPrivacySettingResponse } from './dto/get-doctor-security-and-privacy-setting.dto';
import {
  UpdateDoctorSecurityAndPrivacySettingInput,
  UpdateDoctorSecurityAndPrivacySettingResp,
} from './dto/doctor-sectrity-and-privacy-settings.dto';
import {
  UpdateDoctorNotificationSettingsInput,
  UpdateDoctorNotificationSettingsResp,
} from './dto/doctor-notification-settings.dto';
import { DoctorsService } from './doctors.service';
import {
  UpdateDoctorProfileInput,
  UpdateDoctorProfileResponse,
} from './dto/update-doctor-profile.dto';
import { GetDoctorAccountInfoResponse } from './dto/get-doctor-account-info.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { GetSpecialitiesListResponse } from './dto/get-specialities-list.dto';
import {
  UpdateDoctorStatusArgs,
  UpdateDoctorStatusResp,
} from './dto/update-doctor-status.dto';
import {
  GetTreatmentDoctorsArgs,
  GetTreatmentDoctorsResponse,
} from './dto/get-treatment-doctors.dto';
import { GetDoctorProfileResponse } from './dto/get-doctor-profile.dto';
import {
  ResendDoctorLoginOtpArgs,
  ResendDoctorLoginOtpResponse,
} from './dto/resend-doctor-login-otp.dto';
import {
  GetOrganizationDoctorsArgs,
  GetOrganizationDoctorsResponse,
} from './dto/get-organization-doctors.dto';
import {
  GetDoctorPatientsArgs,
  GetDoctorPatientsResponse,
} from './dto/get-doctor-patients.dto';
import {
  GetOtherDoctorProfileArgs,
  GetOtherDoctorProfileResponse,
} from './dto/get-other-doctor-profile.dto';
import {
  CreateSupportQuestionInput,
  CreateSupportQuestionResponse,
} from './dto/create-support-question.dto';

@Resolver()
export class DoctorsResolver {
  constructor(private readonly doctorsService: DoctorsService) {}
  @Mutation(() => CommonResponseMessage, { name: 'registerPassword' })
  async registerPassword(
    @Args() args: RegisterPasswordArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.registerPassword(args);
  }

  @Mutation(() => RefreshTokenResponse, { name: 'doctorRefreshToken' })
  async doctorRefreshToken(
    @Args() args: DoctorRefreshTokenArgs,
  ): Promise<RefreshTokenResponse> {
    return this.doctorsService.doctorRefreshToken(args.token);
  }
  @Mutation(() => DoctorLoginResponse, { name: 'doctorLogin' })
  async doctorLogin(
    @Args() args: DoctorLoginArgs,
  ): Promise<DoctorLoginResponse> {
    return this.doctorsService.doctorLogin(args);
  }

  @Mutation(() => CommonResponseMessage, { name: 'setDoctorScreenName' })
  async setDoctorScreenName(
    @Args() args: SetDoctorScreenNameArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.setDoctorScreenName(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CommonResponseMessage, { name: 'resetDoctorPin' })
  async resetDoctorPin(
    @GetUser() user: LoggedInUser,
    @Args() args: ResetDoctorPinArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.resetDoctorPin(user.id, args.pin);
  }

  @Mutation(() => CommonResponseMessage, { name: 'setDoctorProfilePicture' })
  async setDoctorProfilePicture(
    @Args() args: SetDoctorProfilePictureArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.setDoctorProfilePicture(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => GenerateTokens, { name: 'checkDoctorPin' })
  async checkDoctorPin(
    @GetUser() user: LoggedInUser,
    @Args() args: CheckDoctorPinArgs,
  ): Promise<GenerateTokens> {
    return this.doctorsService.checkDoctorPin(user.id, args.pin);
  }

  @Mutation(() => CommonResponseMessage, { name: 'sendDoctorForgotPin' })
  async sendDoctorForgotPin(
    @Args() args: DoctorForgotPinArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.sendDoctorForgotPin(args.email);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CommonResponseMessage, { name: 'addDoctorPin' })
  async addDoctorPin(
    @GetUser() user: LoggedInUser,
    @Args() args: AddDoctorPinArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.addDoctorPin(user.id, args.pin);
  }

  @Mutation(() => CommonResponseMessage, { name: 'verifyDoctorEmail' })
  async verifyDoctorEmail(
    @Args() args: VerifyDoctorEmailArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.verifyDoctorEmail(args);
  }

  @Mutation(() => CommonResponseMessage, {
    name: 'sendDoctorVerificationEmail',
  })
  async sendDoctorVerificationEmail(
    @Args() args: SendDoctorVerificationEmailArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.sendDoctorVerificationEmail(args.id);
  }

  @Mutation(() => DoctorRegisterResponse, { name: 'registerDoctor' })
  async registerDoctor(
    @Args() args: RegisterDoctorArgs,
  ): Promise<DoctorRegisterResponse> {
    return this.doctorsService.registerDoctor(args.email);
  }

  @Mutation(() => CommonResponseMessage, { name: 'doctorResetPassword' })
  async doctorResetPassword(
    @Args() args: DoctorResetPasswordArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.doctorResetPassword(args);
  }
  @Mutation(() => CommonResponseMessage, { name: 'doctorForgotPassword' })
  async doctorForgotPassword(
    @Args() args: DoctorForgetPasswordArgs,
  ): Promise<CommonResponseMessage> {
    return this.doctorsService.doctorForgotPassword(args.email);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserResponse, { name: 'searchUsers' })
  async searchUsers(
    @GetUser() user: LoggedInUser,
    @Args() args: GetSearchUsersArgs,
  ): Promise<GetUserResponse> {
    return await this.doctorsService.searchUsers(args, user.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => DoctorPatientsListOutput, { name: 'doctorPatientsList' })
  async doctorPatientsList(
    @GetUser() user: LoggedInUser,
    @Args({ name: 'input' }) input: DoctorPatientsListInput,
  ): Promise<DoctorPatientsListOutput> {
    return await this.doctorsService.doctorPatientsList(input, user.id);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorListResponse, { name: 'getDoctorList' })
  async getDoctorList(
    @Args() args: GetDoctorListArgs,
  ): Promise<GetDoctorListResponse> {
    return this.doctorsService.getDoctorList(args);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddDoctorResponse, { name: 'addDoctor' })
  async addDoctor(
    @Args({ name: 'input' }) input: CreateDoctorInput,
  ): Promise<AddDoctorResponse> {
    return this.doctorsService.addDoctor(input);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorResponse, { name: 'getDoctor' })
  async getDoctor(@Args() args: GetDoctorArgs): Promise<GetDoctorResponse> {
    return this.doctorsService.getDoctor(args.doctorId);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateDoctorResponse, { name: 'updateDoctor' })
  async updateDoctor(
    @Args() args: UpdateDoctorArgs,
    @Args({ name: 'input' }) input: UpdateDoctorInput,
  ): Promise<UpdateDoctorResponse> {
    return this.doctorsService.updateDoctor(args.doctorId, input);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => SendChangeDoctorEmailRequestResponse, {
    name: 'sendChangeDoctorEmailRequest',
  })
  async sendChangeDoctorEmailRequest(
    @GetUser() doctor: LoggedInUser,
    @Args() args: SendChangeDoctorEmailRequestArgs,
  ): Promise<SendChangeDoctorEmailRequestResponse> {
    return await this.doctorsService.sendChangeDoctorEmailRequest(
      doctor.id,
      args.email,
    );
  }

  @Mutation(() => VerifyChangeDoctorEmailResponse, {
    name: 'verifyChangeDoctorEmailRequest',
  })
  async verifyChangeDoctorEmailRequest(
    @Args() args: VerifyChangeDoctorEmailArgs,
  ): Promise<VerifyChangeDoctorEmailResponse> {
    return await this.doctorsService.verifyChangeDoctorEmailRequest(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorsResponse, { name: 'getDoctors' })
  async getDoctors(@GetUser() user: LoggedInUser): Promise<GetDoctorsResponse> {
    return this.doctorsService.getDoctors(user.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DeleteDoctorAccountResponse, { name: 'deleteDoctorAccount' })
  async deleteDoctorAccount(
    @GetUser() doctor: LoggedInUser,
    @Args() args: DeleteDoctorAccountArgs,
  ): Promise<DeleteDoctorAccountResponse> {
    return await this.doctorsService.deleteDoctorAccount(
      doctor.id,
      args.password,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChangeDoctorPinResponse, { name: 'changeDoctorPin' })
  async changeDoctorPin(
    @GetUser() doctor: LoggedInUser,
    @Args() args: ChangeDoctorPinArgs,
  ): Promise<ChangeDoctorPinResponse> {
    return await this.doctorsService.changeDoctorPin(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => DoctorSecurityAndPrivacySettingResponse, {
    name: 'getDoctorSecurityAndPrivacySetting',
  })
  async getDoctorSecurityAndPrivacySetting(
    @GetUser() doctor: LoggedInUser,
  ): Promise<DoctorSecurityAndPrivacySettingResponse> {
    return await this.doctorsService.getDoctorSecurityAndPrivacySetting(
      doctor.id,
    );
  }

  @Mutation(() => VerifyDoctorLoginResponse, { name: 'verifyDoctorLoginOtp' })
  async verifyDoctorLoginOtp(
    @Args() args: VerifyDoctorLoginOtpArgs,
  ): Promise<VerifyDoctorLoginResponse> {
    return await this.doctorsService.verifyDoctorLoginOtp(args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => DoctorNotificationSettingResponse, {
    name: 'getDoctorNotificationSetting',
  })
  async getDoctorNotificationSetting(
    @GetUser() doctor: LoggedInUser,
  ): Promise<DoctorNotificationSettingResponse> {
    return this.doctorsService.getDoctorNotificationSetting(doctor.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => LogoutDoctorResponse, { name: 'logoutDoctor' })
  async logoutDoctor(
    @GetUser() user: LoggedInUser,
  ): Promise<LogoutDoctorResponse> {
    return this.doctorsService.logoutDoctor(user.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChangeDoctorPasswordResp, { name: 'changeDoctorPassword' })
  async changeDoctorPassword(
    @GetUser() doctor: LoggedInUser,
    @Args() args: ChangeDoctorPasswordArgs,
  ): Promise<ChangeDoctorPasswordResp> {
    return await this.doctorsService.changeDoctorPassword(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateDoctorSecurityAndPrivacySettingResp, {
    name: 'updateDoctorSecurityAndPrivacySetting',
  })
  async updateDoctorSecurityAndPrivacySetting(
    @GetUser() doctor: LoggedInUser,
    @Args('input') input: UpdateDoctorSecurityAndPrivacySettingInput,
  ): Promise<UpdateDoctorSecurityAndPrivacySettingResp> {
    return this.doctorsService.updateDoctorSecurityAndPrivacySetting(
      doctor.id,
      input,
    );
  }

  @Mutation(() => ResendDoctorLoginOtpResponse, {
    name: 'resendDoctorLoginOtp',
  })
  async resendDoctorLoginOtp(
    @Args() args: ResendDoctorLoginOtpArgs,
  ): Promise<ResendDoctorLoginOtpResponse> {
    return await this.doctorsService.resendDoctorLoginOtp(args.token);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateDoctorProfileResponse, { name: 'updateDoctorProfile' })
  async updateDoctorProfile(
    @GetUser() doctor: LoggedInUser,
    @Args({ name: 'input' }) input: UpdateDoctorProfileInput,
  ): Promise<UpdateDoctorProfileResponse> {
    return await this.doctorsService.updateDoctorProfile(doctor.id, input);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateDoctorNotificationSettingsResp, {
    name: 'updateDoctorNotificationSettings',
  })
  async updateDoctorNotificationSettings(
    @GetUser() doctor: LoggedInUser,
    @Args('input') input: UpdateDoctorNotificationSettingsInput,
  ): Promise<UpdateDoctorNotificationSettingsResp> {
    return await this.doctorsService.updateDoctorNotificationSettings(
      doctor.id,
      input,
    );
  }

  @Query(() => GetTreatmentDoctorsResponse, {
    name: 'getTreatmentDoctors',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTreatmentDoctors(
    @GetUser() user: LoggedInUser,
    @Args() args: GetTreatmentDoctorsArgs,
  ): Promise<GetTreatmentDoctorsResponse> {
    return await this.doctorsService.getTreatmentDoctors(user.id, args);
  }

  @Query(() => GetDoctorPatientsResponse, {
    name: 'getDoctorPatients',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorPatients(
    @GetUser() doctor: LoggedInUser,
    @Args() args: GetDoctorPatientsArgs,
  ): Promise<GetDoctorPatientsResponse> {
    return await this.doctorsService.getDoctorPatients(doctor.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetOrganizationDoctorsResponse, {
    name: 'getOrganizationDoctors',
  })
  async getOrganizationDoctors(
    @GetUser() doctor: LoggedInUser,
    @Args() args: GetOrganizationDoctorsArgs,
  ): Promise<GetOrganizationDoctorsResponse> {
    return await this.doctorsService.getOrganizationDoctors(
      args,
      doctor.id,
      doctor.organization_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorAccountInfoResponse, { name: 'getDoctorAccountInfo' })
  async getDoctorAccountInfo(
    @GetUser() doctor: LoggedInUser,
  ): Promise<GetDoctorAccountInfoResponse> {
    return await this.doctorsService.getDoctorAccountInfo(doctor.id);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorProfileResponse, { name: 'getDoctorProfile' })
  async getDoctorProfile(
    @GetUser() doctor: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetDoctorProfileResponse> {
    return await this.doctorsService.getDoctorProfile(doctor.id, lang);
  }

  @Roles(UserRoles.DOCTOR, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetOtherDoctorProfileResponse, { name: 'getOtherDoctorProfile' })
  async getOtherDoctorProfile(
    @Args() args: GetOtherDoctorProfileArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetOtherDoctorProfileResponse> {
    return await this.doctorsService.getDoctorProfile(args.doctorId, lang);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateDoctorStatusResp, {
    name: 'updateDoctorStatus',
  })
  async updateDoctorStatus(
    @GetUser() doctor: LoggedInUser,
    @Args() args: UpdateDoctorStatusArgs,
  ): Promise<UpdateDoctorStatusResp> {
    const result = await this.doctorsService.updateDoctorStatus(
      doctor.id,
      args.status,
    );
    return result;
  }

  @Query(() => GetSpecialitiesListResponse, { name: 'getSpecialitiesList' })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getSpecialitiesList(
    @I18nNextLanguage() lang: string,
  ): Promise<GetSpecialitiesListResponse> {
    return await this.doctorsService.getSpecialitiesList(lang);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CreateSupportQuestionResponse, {
    name: 'createSupportQuestion',
  })
  async createSupportQuestion(
    @GetUser() doctor: LoggedInUser,
    @Args('input') input: CreateSupportQuestionInput,
  ): Promise<CreateSupportQuestionResponse> {
    return await this.doctorsService.createSupportQuestion(doctor.id, input);
  }
}
