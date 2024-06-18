import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { AgeGroups } from '../users/users.dto';
import {
  ResendActivationCodeArgs,
  PukResendActivationCodeApiResponse,
  VerifyPukArgs,
  VerifyPukOutput,
} from './puk.model';

import { PukRepo } from './puk.repo';
import * as datefns from 'date-fns';
import { Users } from '../users/users.model';

@Injectable()
export class PukService {
  private readonly logger = new Logger(PukService.name);
  constructor(private readonly repo: PukRepo) {}

  private getAgeGroup(birthDateString: string): AgeGroups {
    const date = new Date();
    const birthDate = new Date(birthDateString);
    const age = datefns.differenceInYears(date, birthDate);
    const elderAge = 60;
    const adultAge = 16;
    if (age >= elderAge) {
      return AgeGroups.elder;
    }
    if (age >= adultAge) {
      return AgeGroups.adult;
    }
    this.logger.log(birthDateString);
    return AgeGroups.child;
  }

  async verifyCode(input: VerifyPukArgs): Promise<VerifyPukOutput> {
    try {
      const response = await this.repo.verifyPukCode(input);
      const pukReferenceId = response.userIdPuk.toString();
      const ageGroup = this.getAgeGroup(input.birthDate);
      return { puk_reference_id: pukReferenceId, age_group: ageGroup };
    } catch (error) {
      this.logger.log(error['response']['status']);
      if (
        error instanceof AxiosError &&
        error?.response?.status === HttpStatus.NOT_FOUND
      ) {
        this.logger.log(`Checking test puk codes`);
        const user = await this.repo.verifyTestPukCode(input.activationCode);
        if (user) {
          return user;
        }
        if (!user) {
          throw new BadRequestException(
            `That activation code isn’t right. Please try again.`,
          );
        }
      }
      throw new BadRequestException(error.message);
    }
  }

  async resendActivationCode(
    input: ResendActivationCodeArgs,
  ): Promise<PukResendActivationCodeApiResponse> {
    try {
      const response = await this.repo.resendActivationCode(input);
      const success = Boolean(response.success.toString());
      return { success: success };
    } catch (error) {
      this.logger.log(error['response']['status']);
      const success = Boolean(error['response']['data']['success']);
      const msg = String(error['response']['data']['msg']);
      if (
        error instanceof AxiosError &&
        error?.response?.status === HttpStatus.NOT_FOUND
      ) {
        return { success: success, msg: msg };
      }
      throw new BadRequestException(error.message);
    }
  }

  async logActivity(user: Users): Promise<string> {
    try {
      const { puk_reference_id } = user;
      if (user.is_test_puk) {
        this.logger.warn(`User login using test puk account`);
        return 'success';
      }
      await this.repo.pukLogActivity({
        userIdPuk: puk_reference_id,
      });
      return 'success';
    } catch (error) {
      this.logger.log(error['response']['status']);
      if (error instanceof AxiosError && error?.response) {
        const msg = String(error['response']['data']['msg']);
        return msg;
      }
      throw new BadRequestException(error.message);
    }
  }

  async confirmRegistration(user: Users): Promise<string> {
    try {
      const { puk_reference_id } = user;
      if (user.is_test_puk) {
        this.logger.warn(`User created using test puk`);
        return 'success';
      }
      await this.repo.confirmRegistration({
        userIdPuk: puk_reference_id,
      });
      return 'success';
    } catch (error) {
      if (error instanceof AxiosError && error?.response) {
        const msg = String(error['response']['data']['msg']);
        return msg;
      }
      throw new BadRequestException(error.message);
    }
  }
}
