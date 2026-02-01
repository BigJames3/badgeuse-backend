import { RoleEnum } from '../../shared/enums/role.enum';

export class UserEntity {
  id!: string;
  email!: string;
  name?: string | null;
  roles!: RoleEnum[];
  companyId!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
