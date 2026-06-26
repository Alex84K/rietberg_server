import { Registration } from './registration.entity';

export interface RegistrationRepository {
  findById(id: string): Promise<Registration | null>;
  findByUserId(userId: string): Promise<Registration[]>;
  findByEventAndUser(eventId: string, userId: string): Promise<Registration | null>;
  findBySlotId(slotId: string): Promise<Registration[]>;
  /** Sum of (1 + additionalGuests) for all registrations on this slot */
  countOccupancy(slotId: string): Promise<number>;
  save(registration: Registration): Promise<void>;
  deleteByEventId(eventId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
