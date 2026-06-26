import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import { Event } from '../../domain/event.aggregate';

export interface ListEventsQuery {
  from: Date;
  to: Date;
}

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: ListEventsQuery): Promise<Event[]> {
    return this.eventRepository.findByDateRange(query.from, query.to);
  }
}
