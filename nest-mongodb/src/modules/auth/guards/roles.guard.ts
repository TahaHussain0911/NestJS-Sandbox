import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../enums/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // reflector is used to retrieve metadata added with SetMetadata attached to controllers 
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // gets method like Post request
      context.getClass(), // gets class like AuthController
    ]);
    if (!requiredRoles) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRole(requiredRoles, user.role);
  }
}
function matchRole(requiredRoles: string[], roles: string[]) {
  return requiredRoles.some((role) => roles.includes(role));
}
