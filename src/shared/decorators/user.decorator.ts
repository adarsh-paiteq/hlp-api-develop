import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ContextType } from '../guards/api.guard';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === ContextType.HTTP) {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    }
    const newCtx = GqlExecutionContext.create(ctx);
    return newCtx.getContext().req.user;
  },
);
