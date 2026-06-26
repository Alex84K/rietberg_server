import { Event } from './event.aggregate';

export interface PaginatedEvents {
  items: Event[];
  total: number;
}

export interface EventRepository {
  findById(id: string): Promise<Event | null>;
  /** Returns events whose schedule overlaps [from, to]: startsAt <= to AND endsAt >= from */
  findByDateRange(from: Date, to: Date): Promise<Event[]>;
  /** All events sorted by startsAt desc, for admin panel */
  findAllPaginated(skip: number, limit: number): Promise<PaginatedEvents>;
  save(event: Event): Promise<void>;
  delete(id: string): Promise<void>;
}
