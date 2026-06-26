import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import { Event } from '../../domain/event.aggregate';

export interface ListAllEventsQuery {
  page: number;
  limit: number;
}

export interface PaginatedEventsResult {
  items: Event[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable()
export class ListAllEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: ListAllEventsQuery): Promise<PaginatedEventsResult> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const { items, total } = await this.eventRepository.findAllPaginated(skip, limit);
    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
