import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import { Event } from '../../domain/event.aggregate';

export interface AddTimeSlotCommand {
  eventId: string;
  startsAt: Date;
  endsAt?: Date;
  capacity: number;
  label?: string;
}

@Injectable()
export class AddTimeSlotUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: AddTimeSlotCommand): Promise<Event> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundException(`Event ${command.eventId} not found`);
    }

    // addSlot() throws DomainError if kind != REGISTRABLE — NestJS maps it to 400
    const updated = event.addSlot({
      startsAt: command.startsAt,
      endsAt: command.endsAt,
      capacity: command.capacity,
      label: command.label,
    });

    await this.eventRepository.save(updated);
    return updated;
  }
}
