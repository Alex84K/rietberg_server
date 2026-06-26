import { v4 as uuid } from 'uuid';
import { Entity } from '../../../shared/domain/entity.base';

export interface CreateRegistrationProps {
  eventId: string;
  slotId: string;
  userId: string;
  additionalGuests: number;
}

export interface ReconstituteRegistrationProps {
  id: string;
  eventId: string;
  slotId: string;
  userId: string;
  additionalGuests: number;
  createdAt: Date;
}

export class Registration extends Entity {
  readonly eventId: string;
  readonly slotId: string;
  readonly userId: string;
  readonly additionalGuests: number;

  private constructor(
    id: string,
    createdAt: Date,
    eventId: string,
    slotId: string,
    userId: string,
    additionalGuests: number,
  ) {
    super(id, createdAt);
    this.eventId = eventId;
    this.slotId = slotId;
    this.userId = userId;
    this.additionalGuests = additionalGuests;
  }

  static create(props: CreateRegistrationProps): Registration {
    return new Registration(
      uuid(),
      new Date(),
      props.eventId,
      props.slotId,
      props.userId,
      props.additionalGuests,
    );
  }

  static reconstitute(props: ReconstituteRegistrationProps): Registration {
    return new Registration(
      props.id,
      props.createdAt,
      props.eventId,
      props.slotId,
      props.userId,
      props.additionalGuests,
    );
  }

  /** Total seats taken: the registered user + additional guests */
  get occupancy(): number {
    return 1 + this.additionalGuests;
  }
}
