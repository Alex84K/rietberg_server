import { Birthday } from '../../../domain/birthday.entity';
import { BirthdaySchema } from './birthday.schema';

export class BirthdayMapper {
  static toDomain(raw: BirthdaySchema): Birthday {
    return Birthday.reconstitute({
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      birthDate: raw.birthDate,
      note: raw.note ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(birthday: Birthday): Partial<BirthdaySchema> {
    return {
      id: birthday.id,
      firstName: birthday.firstName,
      lastName: birthday.lastName,
      birthDate: birthday.birthDate,
      note: birthday.note,
      createdAt: birthday.createdAt,
      updatedAt: birthday.updatedAt,
    };
  }
}
