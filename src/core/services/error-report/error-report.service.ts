import { Injectable } from '@nestjs/common';
import { InjectSentry, SentryService } from '@travelerdev/nestjs-sentry';
import { ClsService } from 'nestjs-cls';
import { ClsProperty } from '../../../shared/auth/jwt.strategy';

@Injectable()
export class ErrorReportService {
  constructor(
    @InjectSentry() private readonly sentry: SentryService,
    private readonly cls: ClsService,
  ) {}

  public report(error: unknown): void {
    const reqId = this.cls.getId();
    const userId = this.cls.get(ClsProperty.USER_ID);
    this.sentry.instance().captureException(error, (scope) => {
      scope.setUser({ reqId, userId });
      return scope;
    });
  }
}
