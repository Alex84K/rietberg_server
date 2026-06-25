import { v4 as uuid } from 'uuid';
import { Entity } from '../../../shared/domain/entity.base';
import { Role } from './role.vo';
import { Email } from './email.vo';

export interface CreateUserProps {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}

export interface ReconstituteUserProps {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity {
  readonly email: Email;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly role: Role;
  readonly updatedAt: Date;

  private constructor(
    email: Email,
    passwordHash: string,
    firstName: string,
    lastName: string,
    phone: string,
    role: Role,
    id: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt);
    this.email = email;
    this.passwordHash = passwordHash;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.role = role;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateUserProps): User {
    const now = new Date();
    return new User(
      Email.create(props.email),
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.phone ?? '',
      props.role ?? Role.user(),
      uuid(),
      now,
      now,
    );
  }

  static reconstitute(props: ReconstituteUserProps): User {
    return new User(
      props.email,
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.phone,
      props.role,
      props.id,
      props.createdAt,
      props.updatedAt,
    );
  }

  isAdmin(): boolean {
    return this.role.isAdmin();
  }

  updateProfile(firstName: string, lastName: string, phone: string): User {
    return new User(
      this.email,
      this.passwordHash,
      firstName,
      lastName,
      phone,
      this.role,
      this.id,
      this.createdAt,
      new Date(),
    );
  }

  updateRole(role: Role): User {
    return new User(
      this.email,
      this.passwordHash,
      this.firstName,
      this.lastName,
      this.phone,
      role,
      this.id,
      this.createdAt,
      new Date(),
    );
  }

  updatePasswordHash(passwordHash: string): User {
    return new User(
      this.email,
      passwordHash,
      this.firstName,
      this.lastName,
      this.phone,
      this.role,
      this.id,
      this.createdAt,
      new Date(),
    );
  }
}
