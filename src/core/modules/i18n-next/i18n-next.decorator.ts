import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Path } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ContextType } from '@shared/guards/api.guard';
import { ValidationArguments } from 'class-validator';

export const I18nLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType() === ContextType.HTTP) {
      const request = ctx.switchToHttp().getRequest();
      return request.language;
    }
    const newCtx = GqlExecutionContext.create(ctx);
    return newCtx.getContext().req.language;
  },
);

export function i18nValidationMessage<K = Record<string, unknown>>(
  key: Path<K>,
  args?: Record<string, unknown>,
) {
  return (a: ValidationArguments): string => {
    const { constraints } = a;
    let { value } = a;
    if (typeof value === 'string') {
      value = value.replace(/\|/g, '');
    }
    return `${key}|${JSON.stringify({
      property: a.property,
      value,
      constraints,
      ...args,
    })}`;
  };
}
