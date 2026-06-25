import { ValueObject } from '../../../shared/domain/value-object.base';

export enum RoleType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class Role extends ValueObject {
  constructor(readonly value: RoleType) {
    super();
  }

  static user(): Role {
    return new Role(RoleType.USER);
  }

  static admin(): Role {
    return new Role(RoleType.ADMIN);
  }

  isAdmin(): boolean {
    return this.value === RoleType.ADMIN;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
