import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import { Schedule } from '../../domain/schedule.vo';
import { Event } from '../../domain/event.aggregate';
import { DomainError } from '../../../../shared/domain/domain-error';

export interface UpdateEventCommand {
  id: string;
  title?: string;
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
  allDay?: boolean;
}

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: UpdateEventCommand): Promise<Event> {
    const event = await this.eventRepository.findById(command.id);
    if (!event) {
      throw new NotFoundException(`Event ${command.id} not found`);
    }

    let schedule = event.schedule;
    if (command.startsAt !== undefined || command.endsAt !== undefined || command.allDay !== undefined) {
      try {
        schedule = Schedule.create({
          startsAt: command.startsAt ?? event.schedule.startsAt,
          endsAt: command.endsAt ?? event.schedule.endsAt,
          allDay: command.allDay ?? event.schedule.allDay,
        });
      } catch (error) {
        if (error instanceof DomainError) throw new BadRequestException(error.message);
        throw error;
      }
    }

    const updated = event.update({
      title: command.title,
      description: command.description,
      schedule,
    });

    await this.eventRepository.save(updated);
    return updated;
  }
}
