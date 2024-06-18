import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import basicAuth from 'express-basic-auth';
import { Request, Response, NextFunction } from 'express';
import { EnvVariable } from '../configs/config';

@Injectable()
export class HttpBasicAuth implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction): unknown {
    const userName = this.configService.getOrThrow<string>(
      EnvVariable.HTTP_BASIC_AUTH_USERNAME,
    );
    const password = this.configService.getOrThrow<string>(
      EnvVariable.HTTP_BASIC_AUTH_PASSWORD,
    );
    const users: Record<string, string> = {};
    users[userName] = password;
    const options: basicAuth.BasicAuthMiddlewareOptions = {
      users,
      challenge: true,
      realm: 'j2ZyreOBVU',
    };
    return basicAuth(options)(req, res, next);
  }
}
