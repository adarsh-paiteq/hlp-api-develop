import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DoctorsRepo } from './doctors.repo';
import { TranslationService } from '@shared/services/translation/translation.service';
import {
  CommonResponseMessage,
  RefreshTokenResponse,
  GenerateTokens,
  AvatarType,
} from '../users/users.model';
import { RegisterPasswordArgs } from './dto/register-password.dto';
import { AuthService } from '@shared/auth/auth.service';
import {
  DoctorLoginArgs,
  DoctorLoginResponse,
  DoctorOnboardingScreens,
  SendDoctorLoginOtpResponse,
  SecuritySettings,
} from './dto/doctor-login.dto';
import { SetDoctorScreenNameArgs } from './dto/set-doctor-screen-name.dto';
import { VerifyDoctorEmailArgs } from './dto/verify-doctor-email.dto';
import { EmailsService } from '../emails/emails.service';
import { Doctor } from './entities/doctors.entity';
import { DoctorRegisterResponse } from './dto/register-doctor.dto';
import { SetDoctorProfilePictureArgs } from './dto/set-doctor-profile-picture.dto';
import { DoctorResetPasswordArgs } from './dto/doctor-reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import { DoctorWebUrlPath } from './dto/doctors.dto';
import { RedisService } from '../core/modules/redis/redis.service';
import { GetSearchUsersArgs, GetUserResponse } from './dto/search-users.dto';
import {
  DoctorPatientsListInput,
  DoctorPatientsListOutput,
  PatientsList,
  PatientsListSortField,
} from './dto/doctor-patients-list.dto';
import { UtilsService } from '../utils/utils.service';
import { UserRoles } from '../users/users.dto';
import {
  AddDoctorResponse,
  CreateDoctorInput,
  InsertDoctor,
  InsertDoctorStatusInfo,
} from './dto/add-doctor.dto';
import {
  GetDoctorListArgs,
  GetDoctorListResponse,
} from './dto/get-doctor-list.dto';
import {
  UpdateDoctorInput,
  UpdateDoctorResponse,
} from './dto/update-doctor.dto';
import { GetDoctorsResponse } from './dto/get-doctors.dto';
import { DeleteDoctorAccountResponse } from './dto/delete-doctor-account.dto';
import { ChangeDoctorPinArgs } from './dto/change-doctor-pin.dto';
import { LogoutDoctorResponse } from './dto/logout-doctor.dto';
import { DoctorNotificationSettingResponse } from './dto/get-doctor-notification-settings.dto';
import {
  SendChangeDoctorEmailRequestResponse,
  UserEmailChangeRequestInput,
} from './dto/send-change-doctor-email-request.dto';
import {
  VerifyChangeDoctorEmailArgs,
  VerifyChangeDoctorEmailResponse,
} from './dto/verify-change-doctor-email-request.dto';
import {
  ChangeDoctorPasswordArgs,
  ChangeDoctorPasswordResp,
} from './dto/change-password.dto';
import {
  UpdateDoctorSecurityAndPrivacySettingInput,
  UpdateDoctorSecurityAndPrivacySettingResp,
} from './dto/doctor-sectrity-and-privacy-settings.dto';
import { totp } from 'otplib';
import {
  VerifyDoctorLoginOtpArgs,
  VerifyDoctorLoginResponse,
} from './dto/verify-doctor-login-otp.dto';
import {
  UpdateDoctorNotificationSettingsInput,
  UpdateDoctorNotificationSettingsResp,
} from './dto/doctor-notification-settings.dto';
import { DoctorSecurityAndPrivacySettingResponse } from './dto/get-doctor-security-and-privacy-setting.dto';
import {
  UpdateDoctorProfileInput,
  UpdateDoctorProfileResponse,
} from './dto/update-doctor-profile.dto';
import { GetDoctorAccountInfoResponse } from './dto/get-doctor-account-info.dto';
import { UpdateDoctorStatusResp } from './dto/update-doctor-status.dto';
import { InsertDoctorStatusLogs } from './dto/create-doctor-status-logs.dto';
import { Speciality } from './entities/specialities.entity';
import { GetSpecialitiesListResponse } from './dto/get-specialities-list.dto';
import {
  UserStatus,
  UserStatusChangedBy,
} from '../users/entities/user-status-info.entity';
import {
  GetTreatmentDoctorsArgs,
  GetTreatmentDoctorsResponse,
} from './dto/get-treatment-doctors.dto';
import {
  DoctorProfileDto,
  GetDoctorProfileResponse,
} from './dto/get-doctor-profile.dto';
import {
  GetOrganizationDoctorsArgs,
  GetOrganizationDoctorsResponse,
} from './dto/get-organization-doctors.dto';
import {
  GetDoctorPatientsArgs,
  GetDoctorPatientsResponse,
} from './dto/get-doctor-patients.dto';
import { DoctorSpecialities } from './entities/doctor-specialities.entity';
import { DoctorProfileVideo } from './entities/doctor-profile-videos.entity';
import {
  CreateSupportQuestionInput,
  CreateSupportQuestionResponse,
  InsertSupportQuestion,
} from './dto/create-support-question.dto';
import { PsyqRepo } from '@psyq/psyq.repo';

@Injectable()
export class DoctorsService {
  private readonly logger = new Logger(DoctorsService.name);
  constructor(
    private readonly doctorsRepo: DoctorsRepo,
    private readonly translationService: TranslationService,
    private readonly authService: AuthService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly utilsService: UtilsService,
    private readonly psyqRepo: PsyqRepo,
  ) {}

  async registerPassword(
    args: RegisterPasswordArgs,
  ): Promise<CommonResponseMessage> {
    const { id, password } = args;
    const doctor = await this.doctorsRepo.getDoctorById(id);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const passwordHash = this.authService.hashPassword(password);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      password: passwordHash,
    });
    return {
      message: this.translationService.translate(`doctors.register_password`),
    };
  }

  async doctorRefreshToken(token: string): Promise<RefreshTokenResponse> {
    const { data, error } = await this.authService.verifyRefreshToken(token);
    if (error) {
      throw new UnauthorizedException(`doctors.expired_token`);
    }
    const doctor = await this.doctorsRepo.getDoctorById(data.id);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const isValid = String(doctor.refresh_token) !== String(token);
    if (isValid) {
      throw new UnauthorizedException(`users.invalid_token`);
    }
    const tokens = await this.authService.getTokens({
      id: doctor.id,
      role: doctor.role,
      email: doctor.email,
    });
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  getDoctorOnboardingScreens(doctor: Doctor): DoctorOnboardingScreens {
    const { password, user_name, file_path, is_email_verified, is_onboarded } =
      doctor;

    const isPasswordSet = !!password;
    const isScreenNameSet = !!user_name;
    const isProfilePictureSet = !!file_path;
    const isEmailVerified = !!is_email_verified;
    const isOnboarded = !!is_onboarded;

    const screens: DoctorOnboardingScreens = {
      isOnboarded,
      isPasswordSet,
      isScreenNameSet,
      isProfilePictureSet,
      isEmailVerified,
    };

    return screens;
  }

  getlockedAccountsKey(email: string): string {
    return `doctor_locked_accounts#${email}`;
  }

  private getLoginAttemptsKey(email: string): string {
    return `doctor_login_attemps#${email}`;
  }

  async isAccountLocked(email: string): Promise<boolean> {
    const key = this.getlockedAccountsKey(email);
    const data = await this.redisService.get(key);
    return data != null;
  }

  async lockAccount(email: string, id: string): Promise<number> {
    const key = this.getlockedAccountsKey(email);
    const expiration = 300;
    await this.redisService.setEx(key, id, expiration);
    await this.redisService.del(this.getLoginAttemptsKey(email));
    return expiration;
  }

  async isMaxLoginAttemptsReached(email: string): Promise<boolean> {
    const key = this.getLoginAttemptsKey(email);
    const maxLoginAttemps = 5;
    const attempts = await this.redisService.incBy(key, 1);
    this.logger.log(`Login attemps ${attempts} of doc ${email}`);
    return attempts >= maxLoginAttemps;
  }

  async sendDoctorOTPLogin(
    doctorId: string,
  ): Promise<SendDoctorLoginOtpResponse> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`users.user_not_found`);
    }

    totp.options = { window: 5, digits: 4 };
    const code = totp.generate(doctor.id);

    const tokens = await this.authService.getTempTokens(doctor);
    const onboardingScreens = this.getDoctorOnboardingScreens(doctor);

    await this.doctorsRepo.updateDoctorById(doctor.id, {
      email_verification_code: code,
      refresh_token: null,
    });

    await this.emailsService.sendUserOTPLoginEmail(doctor.id, code);
    return {
      ...tokens,
      onboardingScreens,
    };
  }

  async doctorLogin(
    credentials: DoctorLoginArgs,
  ): Promise<DoctorLoginResponse> {
    const { email, password: credPassword } = credentials;
    const isAccountLocked = await this.isAccountLocked(email);
    if (isAccountLocked) {
      throw new UnauthorizedException(`doctors.maximum_login_attempts`);
    }
    const [doctor] = await this.doctorsRepo.getDoctorByEmail(email);
    if (!doctor) {
      throw new NotFoundException(`doctors.invalid_email_or_password`);
    }
    const {
      is_deleted,
      password: doctorPassword,
      is_email_verified,
      id: doctorId,
    } = doctor;
    if (is_deleted) {
      throw new BadRequestException(`doctors.blocked_account`);
    }
    if (!is_email_verified) {
      throw new BadRequestException(`doctors.not_email_verified`);
    }
    if (!doctorPassword) {
      throw new NotFoundException(`doctors.invalid_email_or_password`);
    }
    const isPasswordValid = this.authService.compareHash(
      credPassword,
      doctorPassword,
    );
    if (!isPasswordValid) {
      const isMaxLoginAttempsReached = await this.isMaxLoginAttemptsReached(
        email,
      );
      if (isMaxLoginAttempsReached) {
        await this.lockAccount(email, doctor.id);
        throw new UnauthorizedException(`doctors.maximum_login_attempts`);
      }
      throw new UnauthorizedException(`doctors.invalid_email_or_password`);
    }

    const privacyAndSecuritySetting =
      await this.doctorsRepo.getUserPrivacyAndSecuritySetting(doctorId);

    if (!privacyAndSecuritySetting) {
      throw new NotFoundException(
        `doctors.user_security_and_privacy_not_found`,
      );
    }
    const { app_lock_enabled, otp_login_enabled } = privacyAndSecuritySetting;

    const securitySettings: SecuritySettings = {
      app_lock_enabled,
      otp_login_enabled,
    };

    if (otp_login_enabled) {
      const data = await this.sendDoctorOTPLogin(doctor.id);
      return { ...data, securitySettings };
    }

    const tokens = await this.authService.getTokens(doctor);
    const onboardingScreens = this.getDoctorOnboardingScreens(doctor);

    await this.doctorsRepo.updateDoctorById(doctor.id, {
      refresh_token: tokens.refresh_token,
      is_logged_out: false,
    });

    return {
      ...tokens,
      securitySettings,
      onboardingScreens,
    };
  }

  async getDoctor(id: string): Promise<Doctor> {
    const doctor = await this.doctorsRepo.getDoctorById(id);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    return doctor;
  }

  async setDoctorScreenName(
    args: SetDoctorScreenNameArgs,
  ): Promise<CommonResponseMessage> {
    const { id, screen_name } = args;
    const doctor = await this.getDoctor(id);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      user_name: screen_name,
    });
    return {
      message: this.translationService.translate(`doctors.set_screen_name`),
    };
  }

  async setDoctorProfilePicture(
    args: SetDoctorProfilePictureArgs,
  ): Promise<CommonResponseMessage> {
    const { id, ...updates } = args;
    const doctor = await this.getDoctor(id);
    await this.doctorsRepo.updateDoctorById(doctor.id, updates);
    return {
      message: this.translationService.translate(`doctors.set_profile_picture`),
    };
  }

  async checkDoctorPin(id: string, pin: string): Promise<GenerateTokens> {
    const [doctor, userSecurityAndPrivacySetting] = await Promise.all([
      this.doctorsRepo.getDoctorById(id),
      this.doctorsRepo.getUserPrivacyAndSecuritySetting(id),
    ]);

    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    if (!userSecurityAndPrivacySetting.app_access_pin) {
      throw new BadRequestException(`users.app_pin_enabled`);
    }
    const isValid = this.authService.compareHash(
      pin,
      userSecurityAndPrivacySetting.app_access_pin,
    );
    if (!isValid) {
      throw new BadRequestException(`users.pin_incorrect`);
    }
    const tokens = await this.authService.getTokens(doctor);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      refresh_token: tokens.refresh_token,
    });
    return tokens;
  }

  async addDoctorPin(id: string, pin: string): Promise<CommonResponseMessage> {
    const doctor = await this.doctorsRepo.getDoctorById(id);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const pinHash = this.authService.generateHash(pin);
    await this.doctorsRepo.updateDoctorSecurityAndPrivacySetting(doctor.id, {
      app_access_pin: pinHash,
      app_lock_enabled: true,
      is_access_pin_added: true,
    });
    return {
      message: this.translationService.translate(`doctors.lock_enabled`),
    };
  }

  async verifyDoctorEmail(
    args: VerifyDoctorEmailArgs,
  ): Promise<CommonResponseMessage> {
    const { token, id } = args;
    const doctor = await this.doctorsRepo.getDoctorById(id);
    if (!doctor) {
      throw new NotFoundException(`users.user_not_found`);
    }
    const isTokenValid =
      String(doctor.email_verification_token) === String(token);
    if (!isTokenValid) {
      throw new BadRequestException(`users.invalid_token`);
    }
    const { error } = await this.authService.verifyEmailVerificationToken(
      token,
    );
    if (error) {
      throw new BadRequestException(`users.expired_token`);
    }

    await this.doctorsRepo.updateDoctorById(doctor.id, {
      email_verification_token: '',
      is_email_verified: true,
      is_onboarded: true,
    });

    return {
      message: this.translationService.translate(`users.email_verified`),
    };
  }

  async sendDoctorVerificationEmail(
    doctorId: string,
  ): Promise<CommonResponseMessage> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const emailVerificationToken =
      await this.authService.generateEmailVerificationToken(doctor);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      email_verification_token: emailVerificationToken,
    });
    const doctorWebUrl = this.configService.getOrThrow(
      EnvVariable.DOCTOR_WEB_URL,
    );
    const link = `${doctorWebUrl}/${DoctorWebUrlPath.VERIFY_EMAIL}?id=${doctor.id}&token=${emailVerificationToken}`;
    const data = await this.emailsService.sendVerifyEmail(doctor.id, link);
    const isSent = data && data.MessageId;
    const message = isSent
      ? this.translationService.translate(`users.email_sent`)
      : this.translationService.translate(`users.failed_email_sent`);

    return { message: message };
  }

  async registerDoctor(email: string): Promise<DoctorRegisterResponse> {
    const role = UserRoles.DOCTOR;
    const [doctor] = await this.doctorsRepo.getDoctorByEmail(email, role);
    if (!doctor) {
      throw new NotFoundException(`doctors.invalid_email`);
    }
    const onboardingScreens = this.getDoctorOnboardingScreens(doctor);
    return { doctor, onboardingScreens };
  }
  async sendDoctorForgotPin(email: string): Promise<CommonResponseMessage> {
    const [doctor] = await this.doctorsRepo.getDoctorByEmail(email);
    if (!doctor) {
      throw new NotFoundException(`doctors.invalid_email`);
    }
    const { is_onboarded, access_pin_reset_secret, access_pin_reset_code } =
      doctor;
    if (!is_onboarded) {
      throw new BadRequestException(`doctors.on_boarded_false`);
    }
    const token = Number(access_pin_reset_code);
    const secretKey = String(access_pin_reset_secret);
    const isValidCode = await this.authService.verifyOTP(token, secretKey);
    if (isValidCode) {
      throw new BadRequestException(`doctors.code_already_sent`);
    }
    const codeSecret = await this.authService.generateSecret();
    const code = await this.authService.generateOTP(codeSecret);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      access_pin_reset_secret: codeSecret,
      access_pin_reset_code: Number(code),
    });
    const user_name = `${doctor.first_name} ${doctor.last_name}`;
    const data = await this.emailsService.sendDoctorForgetPin(
      doctor.email,
      user_name,
      code,
    );
    const isSent = data && data.MessageId;
    const message = isSent
      ? this.translationService.translate(`users.email_sent`)
      : this.translationService.translate(`users.failed_email_sent`);

    return { message: message };
  }

  async doctorResetPassword(
    args: DoctorResetPasswordArgs,
  ): Promise<CommonResponseMessage> {
    const { id: doctorId, token, password } = args;
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const { forgot_password_token } = doctor;
    if (!forgot_password_token) {
      throw new BadRequestException(`users.invalid_token`);
    }
    const isTokenValid = forgot_password_token === token;
    if (!isTokenValid) {
      throw new BadRequestException(`users.invalid_token`);
    }
    const { error } = await this.authService.verifyChangePasswordToken(token);
    if (error) {
      throw new BadRequestException(`users.invalid_expired`);
    }
    const hashedPassword = this.authService.hashPassword(password);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      password: hashedPassword,
      forgot_password_token: '',
    });
    return {
      message: this.translationService.translate(`doctors.password_updated`),
    };
  }
  async sendForgotPasswordToken(
    doctor: Doctor,
  ): Promise<CommonResponseMessage> {
    const changePasswordToken =
      await this.authService.generateChangePasswordToken(doctor);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      forgot_password_token: changePasswordToken,
    });
    const doctorWebUrl = this.configService.getOrThrow(
      EnvVariable.DOCTOR_WEB_URL,
    );
    const link = `${doctorWebUrl}/${DoctorWebUrlPath.RESET_PASSWORD}?id=${doctor.id}&token=${changePasswordToken}`;
    const data = await this.emailsService.sendForgotPassword(doctor.id, link);
    const isSent = data && data.MessageId;
    const message = isSent
      ? this.translationService.translate(`users.email_sent`)
      : this.translationService.translate(`users.failed_email_sent`);

    return { message: message };
  }
  async doctorForgotPassword(email: string): Promise<CommonResponseMessage> {
    const [doctor] = await this.doctorsRepo.getDoctorByEmail(email);
    if (!doctor) {
      throw new NotFoundException(`doctors.invalid_email`);
    }
    const { forgot_password_token, is_onboarded } = doctor;
    if (!is_onboarded) {
      throw new BadRequestException(`doctors.on_boarded_false`);
    }
    if (!forgot_password_token) {
      return this.sendForgotPasswordToken(doctor);
    }
    const { error } = await this.authService.verifyChangePasswordToken(
      forgot_password_token,
    );
    if (!error) {
      throw new BadRequestException(`doctors.send_email_token`);
    }

    return this.sendForgotPasswordToken(doctor);
  }

  async resetDoctorPin(
    userId: string,
    pin: string,
  ): Promise<CommonResponseMessage> {
    const doctor = await this.doctorsRepo.getDoctorById(userId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const pinHash = this.authService.generateHash(pin);
    await this.doctorsRepo.updateDoctorSecurityAndPrivacySetting(doctor.id, {
      app_access_pin: pinHash,
    });
    return {
      message: this.translationService.translate(`doctors.Pin_updated`),
    };
  }

  async searchUsers(
    args: GetSearchUsersArgs,
    doctorId: string,
  ): Promise<GetUserResponse> {
    const { text, page, limit } = args;
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const { organization_id } = doctor;
    const { users, total } = await this.doctorsRepo.searchUsers(
      page,
      limit,
      organization_id,
      text,
    );
    const total_pages = Math.ceil(total / limit);
    return {
      total: total,
      totalPage: total_pages,
      page: page,
      limit: limit,
      users: users,
    };
  }

  async doctorPatientsList(
    input: DoctorPatientsListInput,
    doctorId: string,
  ): Promise<DoctorPatientsListOutput> {
    const { page, limit, sort_field, sort_order } = input;

    const { patients: data, total } =
      await this.doctorsRepo.getDoctorPatientsList(input, doctorId);
    const totalPages = Math.ceil(total / limit);

    let patients = this.translationService.getTranslations<PatientsList>(data, [
      'title',
    ]);

    if (sort_field === PatientsListSortField.TREATMENT) {
      patients = this.utilsService.sortTranslatedData<PatientsList>(
        patients,
        ['title'],
        sort_order,
      );
    }

    return { patients, total, totalPages, page, limit };
  }

  async addDoctor(
    createDoctorInput: CreateDoctorInput,
  ): Promise<AddDoctorResponse> {
    const { email } = createDoctorInput;
    const role = UserRoles.DOCTOR;
    const [doctor] = await this.doctorsRepo.getDoctorByEmail(email);
    if (doctor) {
      throw new BadRequestException(`doctors.doctor_already_exists`);
    }
    let employee_number = createDoctorInput.employee_number;

    if (!employee_number) {
      const psyqEmployee = await this.psyqRepo.getEmployeeByEmail(email);
      if (psyqEmployee?.id) {
        employee_number = psyqEmployee.id;
      }
    }

    const saveDoctorInput: InsertDoctor = {
      ...createDoctorInput,
      role,
      avatar_type: AvatarType.IMAGE,
      accepted_terms_and_conditions: true,
      last_login_time: new Date(),
      is_deleted: false,
    };
    const savedDoctor = await this.doctorsRepo.addDoctor(saveDoctorInput);
    const doctorStatusInfoInput: InsertDoctorStatusInfo = {
      user_id: savedDoctor.id,
      status: UserStatus.OFFLINE,
      status_changed_by: UserStatusChangedBy.SERVER,
    };
    await Promise.all([
      this.doctorsRepo.saveDoctorNotificationSettings(savedDoctor.id),
      this.doctorsRepo.saveDoctorSecurityAndPrivacySettings(savedDoctor.id),
      this.doctorsRepo.saveDoctorStatusInfo(doctorStatusInfoInput),
    ]);
    return savedDoctor;
  }
  async getDoctorSecurityAndPrivacySetting(
    doctorId: string,
  ): Promise<DoctorSecurityAndPrivacySettingResponse> {
    const doctorSecurityAndPrivacySetting =
      await this.doctorsRepo.getUserPrivacyAndSecuritySetting(doctorId);
    if (!doctorSecurityAndPrivacySetting) {
      throw new NotFoundException(
        `doctors.user_security_and_privacy_not_found`,
      );
    }
    return { doctorSecurityAndPrivacySetting };
  }
  async getDoctorList(args: GetDoctorListArgs): Promise<GetDoctorListResponse> {
    const { page, limit } = args;
    const role = UserRoles.DOCTOR;
    const { doctors, total } = await this.doctorsRepo.getDoctorList(role, args);
    const totalPages = Math.ceil(total / limit);
    return { doctors, total, totalPages, page, limit };
  }

  async updateDoctor(
    doctorId: string,
    updateDoctorInput: UpdateDoctorInput,
  ): Promise<UpdateDoctorResponse> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new BadRequestException(`doctors.doctor_not_found`);
    }
    const updatedDoctor = await this.doctorsRepo.updateDoctorById(
      doctor.id,
      updateDoctorInput,
    );
    return updatedDoctor;
  }
  async checkEmailAvailability(email: string): Promise<void> {
    const [doctor] = await this.doctorsRepo.getDoctorByEmail(email);
    if (doctor) {
      throw new NotFoundException(`doctors.doctor_already_exists`);
    }
    return;
  }
  async sendChangeDoctorEmailRequest(
    doctorId: string,
    email: string,
  ): Promise<SendChangeDoctorEmailRequestResponse> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    await this.checkEmailAvailability(email);
    const emailVerificationToken =
      await this.authService.generateEmailVerificationToken(doctor);
    const usersEmailChangeRequestInput: UserEmailChangeRequestInput = {
      user_id: doctorId,
      token: emailVerificationToken,
      email: email,
    };
    const savedUserEmailChangedRequest =
      await this.doctorsRepo.addUserEmailChangeRequest(
        usersEmailChangeRequestInput,
      );
    const doctorWebUrl = this.configService.getOrThrow(
      EnvVariable.DOCTOR_WEB_URL,
    );
    const link = `${doctorWebUrl}/${DoctorWebUrlPath.VERIFY_EMAIL}?user_id=${savedUserEmailChangedRequest.user_id}&token=${emailVerificationToken}&type=change_email`;
    const name = `${doctor.first_name} ${doctor.last_name}`;
    const data = await this.emailsService.sendChangeDoctorEmailRequest(
      email,
      name,
      link,
    );
    const isSent = data && data.MessageId;
    const message = isSent
      ? this.translationService.translate(`users.email_sent`)
      : this.translationService.translate(`users.failed_email_sent`);

    return { message: message };
  }

  async verifyChangeDoctorEmailRequest(
    args: VerifyChangeDoctorEmailArgs,
  ): Promise<VerifyChangeDoctorEmailResponse> {
    const { token, user_id: doctorId } = args;
    const doctorEmailChangeRequest =
      await this.doctorsRepo.getDoctorEmailChangeRequest(doctorId);
    if (!doctorEmailChangeRequest) {
      throw new NotFoundException(`doctors.user_email_request_not_found`);
    }
    const {
      token: doctorEmailRequestToken,
      email,
      id: doctorEmailChangeRequestId,
    } = doctorEmailChangeRequest;
    const isTokenValid = doctorEmailRequestToken === token;
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
      this.doctorsRepo.updateDoctorEmailChangeRequest(
        doctorEmailChangeRequestId,
      ),
      this.doctorsRepo.updateDoctorById(doctorId, {
        email,
      }),
    ]);
    return {
      message: this.translationService.translate(`users.email_verified`),
    };
  }

  async getDoctors(doctorId: string): Promise<GetDoctorsResponse> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new BadRequestException(`doctors.doctor_not_found`);
    }
    const doctors = await this.doctorsRepo.getDoctors(doctor.organization_id);
    return { doctors };
  }

  async deleteDoctorAccount(
    doctorId: string,
    password: string,
  ): Promise<DeleteDoctorAccountResponse> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new BadRequestException(`doctors.doctor_not_found`);
    }
    const isPasswordValid = this.authService.compareHash(
      password,
      doctor.password || '',
    );
    if (!isPasswordValid) {
      throw new BadRequestException(`users.incorrect_password`);
    }

    await this.doctorsRepo.deleteDoctor(doctorId);
    // TODO: Update the statue of doctor to offline
    return {
      message: this.translationService.translate(
        `users.account_deleted_successfully`,
      ),
    };
  }

  async changeDoctorPin(
    id: string,
    args: ChangeDoctorPinArgs,
  ): Promise<CommonResponseMessage> {
    const { oldPin, newPin } = args;
    const [doctor, userSecurityAndPrivacySetting] = await Promise.all([
      this.doctorsRepo.getDoctorById(id),
      this.doctorsRepo.getUserPrivacyAndSecuritySetting(id),
    ]);

    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    if (!userSecurityAndPrivacySetting.app_access_pin) {
      throw new BadRequestException(`users.app_pin_enabled`);
    }
    const isValid = this.authService.compareHash(
      oldPin,
      userSecurityAndPrivacySetting.app_access_pin,
    );
    if (!isValid) {
      throw new BadRequestException(`users.pin_incorrect`);
    }
    if (oldPin === newPin) {
      throw new BadRequestException(`doctors.same_pin`);
    }
    const pinHash = this.authService.generateHash(newPin);
    await this.doctorsRepo.updateDoctorSecurityAndPrivacySetting(doctor.id, {
      app_access_pin: pinHash,
      app_lock_enabled: true,
    });
    return {
      message: this.translationService.translate(`doctors.pin_change`),
    };
  }

  async changeDoctorPassword(
    doctorId: string,
    args: ChangeDoctorPasswordArgs,
  ): Promise<ChangeDoctorPasswordResp> {
    const { oldPassword, newPassword } = args;
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        `doctors.new_password_cannot_be_same_as_old`,
      );
    }
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new BadRequestException(`doctors.doctor_not_found`);
    }
    const isValidPassword = this.authService.compareHash(
      oldPassword,
      doctor.password || '',
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(`users.incorrect_old_password`);
    }
    const passwordHash = this.authService.hashPassword(newPassword);
    await this.doctorsRepo.updateDoctorById(doctorId, {
      password: passwordHash,
    });
    return {
      message: this.translationService.translate(`doctors.password_updated`),
    };
  }

  async getDoctorNotificationSetting(
    doctorId: string,
  ): Promise<DoctorNotificationSettingResponse> {
    const doctorNotificationSetting =
      await this.doctorsRepo.getDoctorNotificationSetting(doctorId);
    if (!doctorNotificationSetting) {
      throw new NotFoundException(
        `notifications.user_notification_setting_not_found`,
      );
    }
    return { doctorNotificationSetting };
  }

  async logoutDoctor(doctorId: string): Promise<LogoutDoctorResponse> {
    const doctor = await this.doctorsRepo.getDoctorById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    const { is_logged_out } = doctor;
    if (is_logged_out) {
      throw new BadRequestException(`doctors.doctor_already_logout`);
    }
    await this.doctorsRepo.updateDoctorById(doctorId, {
      refresh_token: null,
      is_logged_out: true,
    });
    //TODO: Add Disconnect socket
    return {
      message: this.translationService.translate(`doctors.logout_doctor`),
    };
  }

  async updateDoctorSecurityAndPrivacySetting(
    doctorId: string,
    input: UpdateDoctorSecurityAndPrivacySettingInput,
  ): Promise<UpdateDoctorSecurityAndPrivacySettingResp> {
    const doctorSecurityAndPrivacySetting =
      await this.doctorsRepo.getUserPrivacyAndSecuritySetting(doctorId);
    if (!doctorSecurityAndPrivacySetting) {
      throw new NotFoundException(
        `doctors.user_security_and_privacy_not_found`,
      );
    }
    const securityAndPrivacySettings =
      await this.doctorsRepo.updateDoctorSecurityAndPrivacySetting(
        doctorId,
        input,
      );
    return { securityAndPrivacySettings };
  }
  async updateDoctorProfile(
    doctorId: string,
    input: UpdateDoctorProfileInput,
  ): Promise<UpdateDoctorProfileResponse> {
    const { videos, speciality_ids, ...doctors } = input;
    const uniqueSpecialityIds = [...new Set(speciality_ids)];

    const count = await this.doctorsRepo.getSpecialitiesCount(
      uniqueSpecialityIds,
    );

    if (uniqueSpecialityIds.length !== count) {
      throw new NotFoundException(`specialities.specialities_not_found`);
    }

    //deleting doctors specialities and videos, sequence is important
    await Promise.all([
      this.doctorsRepo.deleteDoctorSpecialities(doctorId),
      this.doctorsRepo.deleteDoctorProfileVideos(doctorId),
    ]);

    const promises: [
      Promise<Doctor>?,
      Promise<DoctorSpecialities[]>?,
      Promise<DoctorProfileVideo[]>?,
    ] = [this.doctorsRepo.updateDoctorById(doctorId, doctors)];

    //insert Specialities
    if (uniqueSpecialityIds.length) {
      const insertDoctorSpecialitiesInput = uniqueSpecialityIds.map(
        (specialityId) => ({
          doctor_id: doctorId,
          speciality_id: specialityId,
        }),
      );
      const insertSpecialitiesPromise = this.doctorsRepo.addDoctorSpecialities(
        insertDoctorSpecialitiesInput,
      );
      promises.push(insertSpecialitiesPromise);
    }

    //insert videos
    if (videos?.length) {
      const insertDoctorProfileVideoInput = videos.map((video) => ({
        ...video,
        doctor_id: doctorId,
      }));
      const insertVideoPromise = this.doctorsRepo.addDoctorProfileVideos(
        insertDoctorProfileVideoInput,
      );
      promises.push(insertVideoPromise);
    }

    await Promise.all(promises);

    return {
      message: `${this.translationService.translate(
        'doctors.doctor_profile_updated',
      )}`,
    };
  }

  async verifyDoctorLoginOtp(
    args: VerifyDoctorLoginOtpArgs,
  ): Promise<VerifyDoctorLoginResponse> {
    const { code, token } = args;
    const { error, data } = await this.authService.verifyTempAccessToken(token);
    if (error) {
      throw new BadRequestException(`users.expired_token`);
    }
    const doctor = await this.doctorsRepo.getDoctorById(data.id);
    if (!doctor) {
      throw new BadRequestException(`doctors.doctor_not_found`);
    }
    const { email_verification_code, id } = doctor;
    if (!email_verification_code) {
      throw new UnauthorizedException(`doctors.invalid_code`);
    }
    const isValidCode =
      totp.verify({ token: code, secret: id }) &&
      email_verification_code === code;

    if (!isValidCode) {
      throw new UnauthorizedException(`doctors.incorrect_verification_code`);
    }

    const privacyAndSecuritySetting =
      await this.doctorsRepo.getUserPrivacyAndSecuritySetting(id);

    const { app_lock_enabled, otp_login_enabled } = privacyAndSecuritySetting;

    const securitySettings: SecuritySettings = {
      app_lock_enabled,
      otp_login_enabled,
    };

    const tokens = await this.authService.getTokens(doctor);
    const onboardingScreens = this.getDoctorOnboardingScreens(doctor);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      email_verification_code: null,
      refresh_token: tokens.refresh_token,
      is_logged_out: false,
    });
    return {
      ...tokens,
      securitySettings,
      onboardingScreens,
    };
  }

  async resendDoctorLoginOtp(token: string): Promise<CommonResponseMessage> {
    const { error, data } = await this.authService.verifyTempAccessToken(token);
    if (error) {
      throw new BadRequestException(`users.expired_token`);
    }
    const doctor = await this.doctorsRepo.getDoctorById(data.id);
    if (!doctor) {
      throw new BadRequestException(`doctors.doctor_not_found`);
    }

    totp.options = { window: 5, digits: 4 };
    const code = totp.generate(doctor.id);
    await this.doctorsRepo.updateDoctorById(doctor.id, {
      email_verification_code: code,
      refresh_token: null,
    });
    await this.emailsService.sendUserOTPLoginEmail(doctor.id, code);

    return {
      message: this.translationService.translate(
        'doctors.otp_send_successfully',
      ),
    };
  }

  async updateDoctorNotificationSettings(
    doctorId: string,
    input: UpdateDoctorNotificationSettingsInput,
  ): Promise<UpdateDoctorNotificationSettingsResp> {
    const checkNotificationSettings =
      await this.doctorsRepo.getNotificationSettings(doctorId);
    if (!checkNotificationSettings) {
      throw new NotFoundException('doctors.notification_settings_not_found');
    }
    const notificationSettings =
      await this.doctorsRepo.updateDoctorNotificationSetting(doctorId, input);
    return { notificationSettings };
  }

  async getTreatmentDoctors(
    userId: string,
    args: GetTreatmentDoctorsArgs,
  ): Promise<GetTreatmentDoctorsResponse> {
    const { page, limit, search } = args;
    const { doctors, total } = await this.doctorsRepo.getTreatmentDoctors(
      userId,
      page,
      limit,
      search,
    );
    const hasMore = args.page * args.limit < total;
    return { doctors, hasMore: hasMore };
  }

  async getDoctorPatients(
    doctorId: string,
    args: GetDoctorPatientsArgs,
  ): Promise<GetDoctorPatientsResponse> {
    const { page, limit, search } = args;
    const { patients, total } = await this.doctorsRepo.getDoctorPatients(
      doctorId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(total / limit);
    return { patients, total, totalPages, page, limit };
  }

  async getDoctorAccountInfo(
    id: string,
  ): Promise<GetDoctorAccountInfoResponse> {
    const doctorInfo = await this.doctorsRepo.getDoctorById(id);
    if (!doctorInfo) {
      throw new NotFoundException(`doctors.doctor_not_found`);
    }
    return { doctorAccountInfo: doctorInfo };
  }

  async getDoctorProfile(
    doctorId: string,
    lang: string,
  ): Promise<GetDoctorProfileResponse> {
    const user = await this.doctorsRepo.getDoctorById(doctorId);
    if (user?.role === UserRoles.USER) {
      throw new BadRequestException(`doctors.user_profile_doesnot_exist`);
    }
    const doctorProfile = await this.doctorsRepo.getDoctorProfile(doctorId);
    const [translatedOrganisation] =
      this.translationService.getTranslations<DoctorProfileDto>(
        [doctorProfile],
        ['name'],
        lang,
      );
    const translatedSpecialities = doctorProfile.specialities
      .map((speciality) => {
        return this.translationService.getTranslations<Speciality>(
          [speciality],
          ['title'],
          lang,
        );
      })
      .flat();

    return {
      doctorProfile: {
        first_name: doctorProfile.first_name,
        last_name: doctorProfile.last_name,
        gender: doctorProfile.gender,
        about_me: doctorProfile.about_me || '',
        file_path: doctorProfile.file_path,
        image_id: doctorProfile.image_id,
        image_url: doctorProfile.image_url,

        organisation_name: translatedOrganisation.name,
        profile_videos: doctorProfile.profile_videos,
        specialities: translatedSpecialities,
        status: doctorProfile.status,
      },
    };
  }

  async updateDoctorStatus(
    doctorId: string,
    status: UserStatus,
  ): Promise<UpdateDoctorStatusResp> {
    const doctorStatusInfo = await this.doctorsRepo.getDoctorStatusInfo(
      doctorId,
    );
    if (!doctorStatusInfo) {
      throw new NotFoundException('doctors.doctor_status_info_not_found');
    }
    const doctorStatusLogs: InsertDoctorStatusLogs = {
      user_id: doctorId,
      previous_status: doctorStatusInfo.status,
      new_status: status,
      status_changed_by: UserStatusChangedBy.USER,
    };

    await Promise.all([
      this.doctorsRepo.updateDoctorStatus(doctorId, status),
      this.doctorsRepo.createUserStatusLog(doctorStatusLogs),
    ]);

    return {
      message: this.translationService.translate(
        'doctors.doctor_status_changed',
      ),
    };
  }

  async getSpecialitiesList(
    lang: string,
  ): Promise<GetSpecialitiesListResponse> {
    const specialitiesList = await this.doctorsRepo.getSpecialitiesList();

    if (!specialitiesList.length) {
      throw new NotFoundException(`specialities.specialities_list_not_found`);
    }

    const translatedSpecialitiesList =
      this.translationService.getTranslations<Speciality>(
        specialitiesList,
        ['title'],
        lang,
      );

    return { specialities: translatedSpecialitiesList };
  }

  async getOrganizationDoctors(
    args: GetOrganizationDoctorsArgs,
    doctorId: string,
    organizationId?: string,
  ): Promise<GetOrganizationDoctorsResponse> {
    const { page, limit, search } = args;
    if (!organizationId) {
      throw new NotFoundException(`toolkits.organization_not_found`);
    }
    const { doctors, total } = await this.doctorsRepo.getOrganizationDoctors(
      page,
      limit,
      doctorId,
      organizationId,
      search,
    );
    const totalPages = Math.ceil(total / limit);
    return { doctors, total, totalPages, page, limit };
  }

  async createSupportQuestion(
    doctorId: string,
    input: CreateSupportQuestionInput,
  ): Promise<CreateSupportQuestionResponse> {
    const supportQuestion: InsertSupportQuestion = {
      ...input,
      doctor_id: doctorId,
    };
    const savedSupportQuestion = await this.doctorsRepo.createSupportQuestion(
      supportQuestion,
    );
    const { title, description } = savedSupportQuestion;
    const customerSupportEmail = this.configService.getOrThrow(
      EnvVariable.CUSTOMER_SUPPORT_EMAIL,
    );
    await this.emailsService.sendSupportQuestionEmail(
      title,
      description,
      customerSupportEmail,
    );
    return {
      message: this.translationService.translate(
        'doctors.sent_support_question',
      ),
    };
  }
}
