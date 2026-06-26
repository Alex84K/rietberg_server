import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY, REGISTRATION_REPOSITORY } from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import type { RegistrationRepository } from '../../domain/registration.repository';
import { EventKind } from '../../domain/event-kind.vo';

export interface MyRegistration {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  eventKind: EventKind;
  schedule: {
    startsAt: Date;
    endsAt: Date;
    allDay: boolean;
  };
  slotId: string;
  slotStartsAt: Date;
  slotEndsAt: Date | null;
  slotLabel: string | null;
  slotCapacity: number;
  additionalGuests: number;
  registeredAt: Date;
}

@Injectable()
export class GetMyRegistrationsUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(userId: string): Promise<MyRegistration[]> {
    const registrations = await this.registrationRepository.findByUserId(userId);

    const results = await Promise.all(
      registrations.map(async (reg) => {
        const event = await this.eventRepository.findById(reg.eventId);
        if (!event) return null; // событие удалено — пропускаем

        const slot = event.findSlot(reg.slotId);
        if (!slot) return null; // слот удалён — пропускаем

        return {
          registrationId: reg.id,
          eventId: event.id,
          eventTitle: event.title,
          eventKind: event.kind,
          schedule: {
            startsAt: event.schedule.startsAt,
            endsAt: event.schedule.endsAt,
            allDay: event.schedule.allDay,
          },
          slotId: slot.id,
          slotStartsAt: slot.startsAt,
          slotEndsAt: slot.endsAt,
          slotLabel: slot.label,
          slotCapacity: slot.capacity,
          additionalGuests: reg.additionalGuests,
          registeredAt: reg.createdAt,
        } satisfies MyRegistration;
      }),
    );

    return (results.filter(Boolean) as MyRegistration[]).sort(
      (a, b) => a.schedule.startsAt.getTime() - b.schedule.startsAt.getTime(),
    );
  }
}
