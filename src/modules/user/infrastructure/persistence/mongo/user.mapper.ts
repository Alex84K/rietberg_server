import { User } from '../../../domain/user.entity';
import { Role, RoleType } from '../../../domain/role.vo';
import { Email } from '../../../domain/email.vo';
import { UserSchema } from './user.schema';

export class UserMapper {
  static toDomain(raw: UserSchema): User {
    return User.reconstitute({
      id: raw.id,
      email: Email.fromPersistence(raw.email),
      passwordHash: raw.passwordHash,
      firstName: raw.firstName,
      lastName: raw.lastName,
      phone: raw.phone ?? '',
      role: new Role(raw.role as RoleType),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? raw.createdAt,
    });
  }

  static toPersistence(user: User): Partial<UserSchema> {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
