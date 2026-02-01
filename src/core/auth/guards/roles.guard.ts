import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../../../shared/enums/role.enum';
import type { CurrentUserData } from '../../../shared/decorators/current-user.decorator';

interface AuthenticatedRequest extends Request {
  user?: CurrentUserData;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const legacyRoles: RoleEnum[] = Array.isArray(user?.roles) ? user.roles : [];
    const rbacRoles: RoleEnum[] = Array.isArray(user?.userRoles)
      ? user.userRoles
          .map((r) => r?.role)
          .filter((role): role is RoleEnum => Boolean(role))
      : [];
    const roleSet = new Set<RoleEnum>([...legacyRoles, ...rbacRoles]);

    return requiredRoles.some((role) => roleSet.has(role));
  }
}
