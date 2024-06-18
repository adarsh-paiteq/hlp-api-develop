import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ContextType } from '../guards/api.guard';

export const I18nNextLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === ContextType.HTTP) {
      const request = ctx.switchToHttp().getRequest();
      return request.language;
    }
    const newCtx = GqlExecutionContext.create(ctx);
    return newCtx.getContext().req.language;
  },
);
