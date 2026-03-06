export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export type WithoutOwnerRole = Exclude<Role, Role.OWNER>;
