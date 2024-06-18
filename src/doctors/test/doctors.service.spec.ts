import { Test, TestingModule } from '@nestjs/testing';
import { DoctorsService } from '../doctors.service';
import { DoctorsRepo } from '../doctors.repo';
import { MockDoctor } from './stubs/doctors.stubs';
import { mockAuthService } from '@shared/auth/test/stubs/auth.stubs';
import { AuthService } from '@shared/auth/auth.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TranslationService } from '@shared/services/translation/translation.service';
import { EmailsService } from '../../emails/emails.service';
import { ConfigService } from '@nestjs/config';
jest.mock('../doctors.repo');
jest.mock('@shared/auth/auth.service');
jest.mock('@shared/services/translation/translation.service');
jest.mock('../../emails/emails.service');

describe('DoctorsService', () => {
  let doctorsService: DoctorsService;
  let doctorsRepo: DoctorsRepo;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        DoctorsRepo,
        AuthService,
        TranslationService,
        EmailsService,
        ConfigService,
      ],
    }).compile();
    doctorsService = module.get<DoctorsService>(DoctorsService);
    doctorsRepo = module.get<DoctorsRepo>(DoctorsRepo);
    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });
  describe('doctorLogin', () => {
    describe('when doctorLogin is called', () => {
      it('should throw error if doctor email not exist ', async () => {
        await expect(
          doctorsService.doctorLogin({
            email: MockDoctor.email,
            password: MockDoctor.password,
          }),
        ).rejects.toThrow(NotFoundException);
      });
      it('should throw error if status is blocked and IsEmailVerified is false', async () => {
        await expect(
          doctorsService.doctorLogin({
            email: MockDoctor.email,
            password: MockDoctor.password,
          }),
        ).rejects.toThrow(BadRequestException);
      });
      it('should login return response if doctor email exist ', async () => {
        const result = await doctorsService.doctorLogin({
          email: MockDoctor.email,
          password: MockDoctor.password,
        });
        expect(result).toEqual({
          id: MockDoctor.id,
          refreshToken: mockAuthService.refreshToken,
          accessToken: mockAuthService.accessToken,
          onboardingScreens: {
            isProfilePictureSet: true,
            isEmailVerified: true,
            isScreenNameSet: true,
            isOnboarded: true,
            isPasswordSet: true,
          },
        });
      });
      it('should throw error if compareHash return false', async () => {
        await expect(
          doctorsService.doctorLogin({
            email: MockDoctor.email,
            password: MockDoctor.password,
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });
  describe('doctorRefreshToken', () => {
    describe('when doctorRefreshToken is called', () => {
      it('should throw error if verifyRefreshToken response error ', async () => {
        await expect(
          doctorsService.doctorRefreshToken(mockAuthService.refreshToken),
        ).rejects.toThrow(UnauthorizedException);
      });
      it('should throw error if doctor not exist', async () => {
        await expect(
          doctorsService.doctorRefreshToken(mockAuthService.refreshToken),
        ).rejects.toThrow(NotFoundException);
      });
      it('should return response if doctor exist ', async () => {
        const result = await doctorsService.doctorRefreshToken(
          mockAuthService.refreshToken,
        );
        expect(result).toEqual({
          id: MockDoctor.id,
          refreshToken: mockAuthService.refreshToken,
          accessToken: mockAuthService.accessToken,
        });
      });
    });
  });
  describe('sendDoctorForgotPin', () => {
    describe('when sendDoctorForgotPin is called', () => {
      it('should throw error if doctor email and isvalid  not exist ', async () => {
        jest.spyOn(doctorsRepo, 'getDoctorByEmail').mockResolvedValueOnce([]);
        await expect(
          doctorsService.sendDoctorForgotPin(MockDoctor.email),
        ).rejects.toThrow(NotFoundException);
      });
      it('should forgotPin return response if doctor email exist ', async () => {
        const result = await doctorsService.sendDoctorForgotPin(
          MockDoctor.email,
        );
        expect(result).toEqual({
          message: 'email sent',
        });
      });
      it('should throw error if doctor  isvalid is true ', async () => {
        await expect(
          doctorsService.sendDoctorForgotPin(MockDoctor.email),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
  describe('doctorForgotPassword', () => {
    describe('when doctorForgotPassword is called', () => {
      it('should throw error if doctor email not exist ', async () => {
        jest.spyOn(doctorsRepo, 'getDoctorByEmail').mockResolvedValueOnce([]);
        await expect(
          doctorsService.doctorForgotPassword(MockDoctor.email),
        ).rejects.toThrow(NotFoundException);
      });
      it('should forgotPassword return response if doctor email exist ', async () => {
        const result = await doctorsService.doctorForgotPassword(
          MockDoctor.email,
        );
        expect(result).toEqual({
          message: 'email sent',
        });
      });
    });
  });

  describe('resetDoctorPin', () => {
    describe('when resetDoctorPin is called', () => {
      it('should throw error if doctor email not exist ', async () => {
        jest.spyOn(doctorsRepo, 'getDoctorByEmail').mockResolvedValueOnce([]);
        await expect(
          doctorsService.resetDoctorPin({
            email: MockDoctor.email,
            password: MockDoctor.password,
            pin: MockDoctor.access_pin,
            code: String(MockDoctor.access_pin_reset_code),
          }),
        ).rejects.toThrow(NotFoundException);
      });
      it('should throw error Password not matched', async () => {
        await expect(
          doctorsService.resetDoctorPin({
            email: MockDoctor.email,
            password: MockDoctor.password,
            pin: MockDoctor.access_pin,
            code: String(MockDoctor.access_pin_reset_code),
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
      it('should should return response if Email exist', async () => {
        jest.spyOn(authService, 'compareHash').mockReturnValueOnce(true);
        const result = await doctorsService.resetDoctorPin({
          email: MockDoctor.email,
          password: MockDoctor.password,
          pin: MockDoctor.access_pin,
          code: String(MockDoctor.access_pin_reset_code),
        });
        expect(result).toEqual({ message: 'email sent' });
      });
    });
  });
  describe('doctorResetPassword', () => {
    describe('when doctorResetPassword is called', () => {
      it('should throw error if doctor not exist', async () => {
        jest.spyOn(doctorsRepo, 'getDoctorById').mockResolvedValueOnce(null);
        await expect(
          doctorsService.doctorResetPassword({
            id: MockDoctor.id,
            token: MockDoctor.forgot_password_token,
            password: MockDoctor.password,
          }),
        ).rejects.toThrow(NotFoundException);
      });
      it('should throw error if verifyRefreshToken response error ', async () => {
        jest
          .spyOn(authService, 'verifyChangePasswordToken')
          .mockResolvedValueOnce({ error: 'Some error' });
        await expect(
          doctorsService.doctorResetPassword({
            id: MockDoctor.id,
            token: MockDoctor.forgot_password_token,
            password: MockDoctor.password,
          }),
        ).rejects.toThrow(BadRequestException);
      });
      it('should return response if doctor exist ', async () => {
        const result = await doctorsService.doctorResetPassword({
          id: MockDoctor.id,
          token: MockDoctor.forgot_password_token,
          password: MockDoctor.password,
        });
        expect(result).toEqual({
          message: 'email sent',
        });
      });
    });
  });
});
