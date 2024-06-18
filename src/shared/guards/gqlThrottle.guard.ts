import {
  Injectable,
  ExecutionContext,
  Request,
  Response,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ContextType } from './api.guard';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): {
    req: Express.Request | Request;
    res: Express.Response | Response;
  } {
    if (context.getType() === ContextType.HTTP) {
      const request: Request = context.switchToHttp().getRequest();
      const response: Request = context.switchToHttp().getResponse();
      return { req: request, res: response };
    }
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
