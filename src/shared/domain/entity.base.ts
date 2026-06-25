import { v4 as uuid } from 'uuid';

export abstract class Entity {
  readonly id: string;
  readonly createdAt: Date;

  constructor(id?: string, createdAt?: Date) {
    this.id = id ?? uuid();
    this.createdAt = createdAt ?? new Date();
  }
}
