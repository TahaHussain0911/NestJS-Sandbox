import { IsEnum, IsMongoId } from 'class-validator';
import { Role, type WithoutOwnerRole } from '../enums/roles.enum';

export class ChangeUserRole {
  @IsMongoId()
  userId: string;

  @IsEnum(Role)
  role: WithoutOwnerRole;
}
