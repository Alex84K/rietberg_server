import { v4 as uuid } from 'uuid';
import { Entity } from '../../../shared/domain/entity.base';

export interface CreateBirthdayProps {
  firstName: string;
  lastName: string;
  birthDate: Date;
  note?: string;
}

export interface ReconstituteBirthdayProps {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Birthday extends Entity {
  readonly firstName: string;
  readonly lastName: string;
  readonly birthDate: Date;
  readonly note: string | null;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    createdAt: Date,
    firstName: string,
    lastName: string,
    birthDate: Date,
    note: string | null,
    updatedAt: Date,
  ) {
    super(id, createdAt);
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
    this.note = note;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateBirthdayProps): Birthday {
    const now = new Date();
    return new Birthday(
      uuid(),
      now,
      props.firstName,
      props.lastName,
      props.birthDate,
      props.note ?? null,
      now,
    );
  }

  static reconstitute(props: ReconstituteBirthdayProps): Birthday {
    return new Birthday(
      props.id,
      props.createdAt,
      props.firstName,
      props.lastName,
      props.birthDate,
      props.note,
      props.updatedAt,
    );
  }

  update(firstName: string, lastName: string, birthDate: Date, note?: string): Birthday {
    return new Birthday(
      this.id,
      this.createdAt,
      firstName,
      lastName,
      birthDate,
      note ?? null,
      new Date(),
    );
  }
}
