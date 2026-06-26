import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY, REGISTRATION_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import type { RegistrationRepository } from '../../domain/registration.repository';

@Injectable()
export class DeleteEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    // cascade: registrations first, then the event
    await this.registrationRepository.deleteByEventId(id);
    await this.eventRepository.delete(id);
  }
}
