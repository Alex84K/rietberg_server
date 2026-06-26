import { ValueObject } from '../../../shared/domain/value-object.base';
import { DomainError } from '../../../shared/domain/domain-error';

export interface ScheduleProps {
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
}

export class Schedule extends ValueObject {
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly allDay: boolean;

  private constructor(props: ScheduleProps) {
    super();
    this.startsAt = props.startsAt;
    this.endsAt = props.endsAt;
    this.allDay = props.allDay;
  }

  static create(props: ScheduleProps): Schedule {
    if (props.endsAt < props.startsAt) {
      throw new DomainError('Schedule endsAt must be >= startsAt');
    }
    return new Schedule(props);
  }

  static fromPersistence(props: ScheduleProps): Schedule {
    return new Schedule(props);
  }

  equals(other: Schedule): boolean {
    return (
      this.startsAt.getTime() === other.startsAt.getTime() &&
      this.endsAt.getTime() === other.endsAt.getTime() &&
      this.allDay === other.allDay
    );
  }

  toString(): string {
    return `${this.startsAt.toISOString()}/${this.endsAt.toISOString()}`;
  }
}
