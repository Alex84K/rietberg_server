import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY, REGISTRATION_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import type { RegistrationRepository } from '../../domain/registration.repository';
import { GetUserUseCase } from '../../../user/application/usecases/get-user.usecase';

export interface SlotParticipant {
  registrationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  additionalGuests: number;
  registeredAt: Date;
}

@Injectable()
export class ListSlotParticipantsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  async execute(eventId: string, slotId: string): Promise<SlotParticipant[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }
    const slot = event.findSlot(slotId);
    if (!slot) {
      throw new NotFoundException(`Slot ${slotId} not found`);
    }

    const registrations = await this.registrationRepository.findBySlotId(slotId);

    const participants = await Promise.all(
      registrations.map(async (reg) => {
        const user = await this.getUserUseCase.execute(reg.userId);
        return {
          registrationId: reg.id,
          userId: reg.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.value,
          additionalGuests: reg.additionalGuests,
          registeredAt: reg.createdAt,
        };
      }),
    );

    return participants.sort(
      (a, b) => a.registeredAt.getTime() - b.registeredAt.getTime(),
    );
  }
}
