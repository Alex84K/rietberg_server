import { Event } from '../../../domain/event.aggregate';
import { EventKind } from '../../../domain/event-kind.vo';
import { Schedule } from '../../../domain/schedule.vo';
import { TimeSlot } from '../../../domain/time-slot.entity';
import { EventSchema } from './event.schema';

export class EventMapper {
  static toDomain(raw: EventSchema): Event {
    const slots = (raw.slots ?? []).map((s) =>
      TimeSlot.reconstitute({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt ?? null,
        capacity: s.capacity,
        label: s.label ?? null,
        createdAt: s.createdAt,
      }),
    );

    return Event.reconstitute({
      id: raw.id,
      title: raw.title,
      description: raw.description ?? '',
      kind: raw.kind as EventKind,
      schedule: Schedule.fromPersistence({
        startsAt: raw.schedule.startsAt,
        endsAt: raw.schedule.endsAt,
        allDay: raw.schedule.allDay,
      }),
      slots,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(event: Event): Partial<EventSchema> {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      kind: event.kind,
      schedule: {
        startsAt: event.schedule.startsAt,
        endsAt: event.schedule.endsAt,
        allDay: event.schedule.allDay,
      },
      slots: event.slots.map((s) => ({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt ?? null,
        capacity: s.capacity,
        label: s.label ?? null,
        createdAt: s.createdAt,
      })) as any,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
