import { ValueObject } from '../../../shared/domain/value-object.base';
import { DomainError } from '../../../shared/domain/domain-error';

export class Email extends ValueObject {
  readonly value: string;

  private constructor(value: string) {
    super();
    this.value = value;
  }

  static create(raw: string): Email {
    const normalized = raw.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new DomainError(`Invalid email: ${raw}`);
    }
    return new Email(normalized);
  }

  static fromPersistence(value: string): Email {
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
