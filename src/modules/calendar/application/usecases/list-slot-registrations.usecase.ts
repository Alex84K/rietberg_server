import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY, REGISTRATION_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import type { RegistrationRepository } from '../../domain/registration.repository';
import { Registration } from '../../domain/registration.entity';

@Injectable()
export class ListSlotRegistrationsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(eventId: string, slotId: string): Promise<Registration[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }
    const slot = event.findSlot(slotId);
    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }
    return this.registrationRepository.findBySlotId(slotId);
  }
}
