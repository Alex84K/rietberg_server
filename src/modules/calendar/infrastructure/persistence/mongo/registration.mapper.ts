import { Registration } from '../../../domain/registration.entity';
import { RegistrationSchema } from './registration.schema';

export class RegistrationMapper {
  static toDomain(raw: RegistrationSchema): Registration {
    return Registration.reconstitute({
      id: raw.id,
      eventId: raw.eventId,
      slotId: raw.slotId,
      userId: raw.userId,
      additionalGuests: raw.additionalGuests ?? 0,
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(registration: Registration): Partial<RegistrationSchema> {
    return {
      id: registration.id,
      eventId: registration.eventId,
      slotId: registration.slotId,
      userId: registration.userId,
      additionalGuests: registration.additionalGuests,
      createdAt: registration.createdAt,
    };
  }
}
