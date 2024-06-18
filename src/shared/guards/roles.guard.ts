import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { UserRoles } from '../../users/users.dto';
import { AuthService } from '../auth/auth.service';
import { ContextType } from './api.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() === ContextType.HTTP) {
      return this.validateRESTRequest(context);
    }
    return this.validateGraphqlRequest(context);
  }

  private validateRESTRequest(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRoles[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.authService.validateRoles(user, roles);
  }

  private validateGraphqlRequest(context: ExecutionContext): boolean {
    const newContext = GqlExecutionContext.create(context);
    const roles = this.reflector.get<UserRoles[]>(
      'roles',
      newContext.getHandler(),
    );
    if (!roles) return true;
    const {
      req: { user },
    } = newContext.getContext();
    return this.authService.validateRoles(user, roles);
  }
}
