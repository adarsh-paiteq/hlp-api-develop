import { Injectable } from '@nestjs/common';
import { Email, ForgotEmailData } from './emails.dto';

@Injectable()
export class EmailsContent {
  forgotPassword(name: string, link: string): Email<ForgotEmailData> {
    const data: ForgotEmailData = {
      name,
      link,
      description: `You have received this email because a password reset was requested against this account. Please reset your password below.
      If you did not request this password reset then simply ignore this email and your password will remain as it was`,
      buttonName: 'Reset Password',
    };
    const email: Email<ForgotEmailData> = {
      subject: 'SuperBrains: Reset your Password',
      data,
    };
    return email;
  }

  forgotPin(name: string, link: string): Email<ForgotEmailData> {
    const data: ForgotEmailData = {
      name,
      link,
      description: `You have received this email because a pin reset was requested against this account. Please reset your pin below.
      If you did not request this pin reset then simply ignore this email and your pin will remain as it was.`,
      buttonName: 'Reset Pin',
    };
    const email: Email<ForgotEmailData> = {
      subject: 'SuperBrains: Reset your Pin',
      data,
    };
    return email;
  }
}
