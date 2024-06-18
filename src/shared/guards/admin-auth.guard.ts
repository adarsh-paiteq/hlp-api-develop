import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const secretToken = this.configService.get<string>(
      'ADMIN_AUTH_TOKEN',
    ) as string;

    const providedToken = request.headers['x-admin-auth-token'] as string;

    if (!providedToken) {
      return false;
    }
    return providedToken === secretToken;
  }
}
