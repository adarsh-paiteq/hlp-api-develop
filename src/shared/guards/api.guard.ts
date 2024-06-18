import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export enum ContextType {
  HTTP = 'http',
  GRAPGQL = 'graphql',
}

@Injectable()
export class ApiGuard implements CanActivate {
  private readonly logger = new Logger(ApiGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  validate(request: Request): boolean {
    const { headers } = request;
    const apiKey = headers['x-api-key'] as string;
    return this.authService.validateApiToken(apiKey);
  }

  validateOauth(request: Request): boolean {
    const { headers } = request;
    const apiKey = headers['x-api-key'] as string;
    return this.authService.validateOauthApiToken(apiKey);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      this.logger.log(`Public request`);
      return true;
    }

    const isOauth = this.reflector.get<boolean>(
      'isOauth',
      context.getHandler(),
    );

    if (isOauth && context.getType() === ContextType.HTTP) {
      this.logger.log(`OAuth request`);
      const request: Request = context.switchToHttp().getRequest();
      return this.validateOauth(request);
    }

    if (context.getType() === ContextType.HTTP) {
      const request: Request = context.switchToHttp().getRequest();
      return this.validate(request);
    }
    const ctx = GqlExecutionContext.create(context);
    return this.validate(ctx.getContext().req);
  }
}
