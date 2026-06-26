import { v4 as uuid } from 'uuid';
import { Entity } from '../../../shared/domain/entity.base';
import { DomainError } from '../../../shared/domain/domain-error';

export interface CreateTimeSlotProps {
  startsAt: Date;
  endsAt?: Date;
  capacity: number;
  label?: string;
}

export interface ReconstituteTimeSlotProps {
  id: string;
  startsAt: Date;
  endsAt: Date | null;
  capacity: number;
  label: string | null;
  createdAt: Date;
}

export class TimeSlot extends Entity {
  readonly startsAt: Date;
  readonly endsAt: Date | null;
  readonly capacity: number;
  readonly label: string | null;

  private constructor(
    id: string,
    createdAt: Date,
    startsAt: Date,
    endsAt: Date | null,
    capacity: number,
    label: string | null,
  ) {
    super(id, createdAt);
    this.startsAt = startsAt;
    this.endsAt = endsAt;
    this.capacity = capacity;
    this.label = label;
  }

  static create(props: CreateTimeSlotProps): TimeSlot {
    if (props.capacity < 1) {
      throw new DomainError('TimeSlot capacity must be >= 1');
    }
    const now = new Date();
    return new TimeSlot(
      uuid(),
      now,
      props.startsAt,
      props.endsAt ?? null,
      props.capacity,
      props.label ?? null,
    );
  }

  static reconstitute(props: ReconstituteTimeSlotProps): TimeSlot {
    return new TimeSlot(
      props.id,
      props.createdAt,
      props.startsAt,
      props.endsAt,
      props.capacity,
      props.label,
    );
  }
}
