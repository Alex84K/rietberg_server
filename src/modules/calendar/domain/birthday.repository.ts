import { Birthday } from './birthday.entity';

export interface BirthdayRepository {
  findAll(): Promise<Birthday[]>;
  findById(id: string): Promise<Birthday | null>;
  save(birthday: Birthday): Promise<void>;
  delete(id: string): Promise<void>;
}
