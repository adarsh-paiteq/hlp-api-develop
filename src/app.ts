import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import morgan from 'morgan';

import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { ErrorResponse } from './shared/filters/all.filter';
import { ValidationError } from 'class-validator';
import { Reflector } from '@nestjs/core';
import { AuthService } from './shared/auth/auth.service';
import { ApiGuard } from './shared/guards/api.guard';
import { ClsMiddleware } from 'nestjs-cls';
import { Environment } from './core/configs/config';

function parseValidationErrors(errors: ValidationError[]): string[] {
  let messages: string[] = [];
  function parse(errors: ValidationError[]): void {
    errors.forEach(($error) => {
      if ($error.children && $error.children.length) {
        parse($error.children);
      } else {
        if ($error.constraints) {
          const errors: string[] = Object.values($error.constraints);
          messages = [...messages, ...errors];
        }
      }
    });
  }
  parse(errors);
  return messages;
}

// change default validation error response
export const validationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  exceptionFactory: (validationErrors) => {
    const [validationError] = validationErrors;
    let constraints = [];
    constraints = parseValidationErrors(validationErrors);
    if (validationError.constraints) {
      constraints = Object.values(validationError.constraints as object);
    }
    const errorMessage: ErrorResponse = {
      message: constraints[0] || '',
      statusCode: 400,
      extensions: {
        code: 'validation-error',
      },
    };
    return new BadRequestException(errorMessage);
  },
});

function isDevelopment(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const isProd = String(nodeEnv) === Environment.LOCAL;
  return isProd;
}

// middlewares and configs
export default function (app: NestExpressApplication, logger: Logger): void {
  const isDev = isDevelopment();
  const morganFormat = isDev ? 'combined' : 'dev';
  app.set('trust proxy', 1);
  app.enableCors({ origin: '*' });
  //TODO: update to jsonformat
  app.use(
    morgan(morganFormat, { stream: { write: (str) => logger.log(str) } }),
  );
  app.use(new ClsMiddleware({ generateId: true }).use);
  app.useGlobalPipes(validationPipe);
  if (isDev) {
    app.use(helmet());
  }

  // api token validation guard
  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);
  app.useGlobalGuards(new ApiGuard(reflector, authService));
}
