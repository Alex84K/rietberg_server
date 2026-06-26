import { v4 as uuid } from 'uuid';
import { Entity } from '../../../shared/domain/entity.base';
import { DomainError } from '../../../shared/domain/domain-error';
import { EventKind } from './event-kind.vo';
import { Schedule } from './schedule.vo';
import { TimeSlot, CreateTimeSlotProps } from './time-slot.entity';

export interface CreateEventProps {
  title: string;
  description?: string;
  kind: EventKind;
  schedule: Schedule;
  createdBy: string;
}

export interface ReconstituteEventProps {
  id: string;
  title: string;
  description: string;
  kind: EventKind;
  schedule: Schedule;
  slots: TimeSlot[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Event extends Entity {
  readonly title: string;
  readonly description: string;
  readonly kind: EventKind;
  readonly schedule: Schedule;
  readonly createdBy: string;
  readonly updatedAt: Date;
  private readonly _slots: TimeSlot[];

  get slots(): ReadonlyArray<TimeSlot> {
    return this._slots;
  }

  private constructor(
    id: string,
    createdAt: Date,
    title: string,
    description: string,
    kind: EventKind,
    schedule: Schedule,
    slots: TimeSlot[],
    createdBy: string,
    updatedAt: Date,
  ) {
    super(id, createdAt);
    this.title = title;
    this.description = description;
    this.kind = kind;
    this.schedule = schedule;
    this._slots = slots;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
  }

  static create(props: CreateEventProps): Event {
    const now = new Date();
    return new Event(
      uuid(),
      now,
      props.title,
      props.description ?? '',
      props.kind,
      props.schedule,
      [],
      props.createdBy,
      now,
    );
  }

  static reconstitute(props: ReconstituteEventProps): Event {
    return new Event(
      props.id,
      props.createdAt,
      props.title,
      props.description,
      props.kind,
      props.schedule,
      props.slots,
      props.createdBy,
      props.updatedAt,
    );
  }

  addSlot(props: CreateTimeSlotProps): Event {
    if (this.kind !== EventKind.REGISTRABLE) {
      throw new DomainError('Cannot add slots to an ANNOUNCEMENT event');
    }
    const slot = TimeSlot.create(props);
    return new Event(
      this.id,
      this.createdAt,
      this.title,
      this.description,
      this.kind,
      this.schedule,
      [...this._slots, slot],
      this.createdBy,
      new Date(),
    );
  }

  removeSlot(slotId: string): Event {
    const exists = this._slots.some((s) => s.id === slotId);
    if (!exists) {
      throw new DomainError(`Slot ${slotId} not found in event ${this.id}`);
    }
    return new Event(
      this.id,
      this.createdAt,
      this.title,
      this.description,
      this.kind,
      this.schedule,
      this._slots.filter((s) => s.id !== slotId),
      this.createdBy,
      new Date(),
    );
  }

  update(props: { title?: string; description?: string; schedule?: Schedule }): Event {
    return new Event(
      this.id,
      this.createdAt,
      props.title ?? this.title,
      props.description ?? this.description,
      this.kind,
      props.schedule ?? this.schedule,
      [...this._slots],
      this.createdBy,
      new Date(),
    );
  }

  findSlot(slotId: string): TimeSlot | undefined {
    return this._slots.find((s) => s.id === slotId);
  }

  isRegistrable(): boolean {
    return this.kind === EventKind.REGISTRABLE;
  }
}
