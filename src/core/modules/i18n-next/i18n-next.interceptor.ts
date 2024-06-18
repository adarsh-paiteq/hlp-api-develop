import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';
import { I18N, i18n } from './i18n-next.provider';

@Injectable()
export class I18nNextInterceptor implements NestInterceptor {
  constructor(
    private readonly clsService: ClsService,
    @Inject(I18N) private readonly i18nNext: i18n,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextType = context.getType<GqlContextType>();
    let lng = this.i18nNext.language;
    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      const { req: request } = ctx;
      if (request && request.language) {
        lng = request.language;
      }
    }
    if (contextType === 'http') {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
      if (request && request.language) {
        lng = request.language;
      }
    }
    this.clsService.set('lng', lng);
    return next.handle();
  }
}
