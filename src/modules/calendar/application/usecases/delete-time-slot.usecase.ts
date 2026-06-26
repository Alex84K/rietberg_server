import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY, REGISTRATION_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import type { RegistrationRepository } from '../../domain/registration.repository';

export interface DeleteTimeSlotCommand {
  eventId: string;
  slotId: string;
}

@Injectable()
export class DeleteTimeSlotUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(command: DeleteTimeSlotCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundException(`Event ${command.eventId} not found`);
    }

    // removeSlot() throws DomainError if slot not found — NestJS maps it to 400
    const updated = event.removeSlot(command.slotId);

    // remove registrations for this slot before saving the event
    const registrations = await this.registrationRepository.findBySlotId(command.slotId);
    await Promise.all(registrations.map((r) => this.registrationRepository.delete(r.id)));

    await this.eventRepository.save(updated);
  }
}
