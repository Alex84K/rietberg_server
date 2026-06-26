import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import { Event } from '../../domain/event.aggregate';
import { EventKind } from '../../domain/event-kind.vo';
import { Schedule } from '../../domain/schedule.vo';

export interface CreateEventCommand {
  title: string;
  description?: string;
  kind: EventKind;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  createdBy: string;
}

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const schedule = Schedule.create({
      startsAt: command.startsAt,
      endsAt: command.endsAt,
      allDay: command.allDay,
    });

    const event = Event.create({
      title: command.title,
      description: command.description,
      kind: command.kind,
      schedule,
      createdBy: command.createdBy,
    });

    await this.eventRepository.save(event);
    return event;
  }
}
