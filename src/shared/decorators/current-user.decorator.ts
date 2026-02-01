import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { RoleEnum } from '../enums/role.enum';

export interface CurrentUserData {
  id: string;
  companyId: string;
  roles: RoleEnum[];
  userRoles?: Array<{ role: RoleEnum }>;
}

interface AuthenticatedRequest extends Request {
  user?: CurrentUserData;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user as CurrentUserData;
  },
);
