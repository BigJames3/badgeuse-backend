import { RoleEnum } from '../../shared/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: RoleEnum[];
  companyId: string;
}
