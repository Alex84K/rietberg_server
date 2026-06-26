import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  EVENT_REPOSITORY,
  REGISTRATION_REPOSITORY,
  NOTIFICATION_SENDER,
} from '../../../../shared/di-tokens';
import type { EventRepository } from '../../domain/event.repository';
import type { RegistrationRepository } from '../../domain/registration.repository';
import type { NotificationSender } from '../../../notifications/application/ports/notification-sender.port';
import { Registration } from '../../domain/registration.entity';
import { EventKind } from '../../domain/event-kind.vo';

export interface RegisterToSlotCommand {
  eventId: string;
  slotId: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  additionalGuests: number;
  adminEmail: string;
}

@Injectable()
export class RegisterToSlotUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    @Inject(NOTIFICATION_SENDER)
    private readonly notificationSender: NotificationSender,
  ) {}

  async execute(command: RegisterToSlotCommand): Promise<Registration> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new NotFoundException(`Event ${command.eventId} not found`);
    }

    if (event.kind !== EventKind.REGISTRABLE) {
      throw new BadRequestException('Cannot register for an ANNOUNCEMENT event');
    }

    const slot = event.findSlot(command.slotId);
    if (!slot) {
      throw new NotFoundException(`Slot ${command.slotId} not found`);
    }

    const existing = await this.registrationRepository.findByEventAndUser(
      command.eventId,
      command.userId,
    );
    if (existing) {
      throw new ConflictException('User is already registered for this event');
    }

    const currentOccupancy = await this.registrationRepository.countOccupancy(command.slotId);
    const requested = 1 + command.additionalGuests;
    if (currentOccupancy + requested > slot.capacity) {
      throw new BadRequestException(
        `Slot has no capacity: ${slot.capacity - currentOccupancy} seats left`,
      );
    }

    const registration = Registration.create({
      eventId: command.eventId,
      slotId: command.slotId,
      userId: command.userId,
      additionalGuests: command.additionalGuests,
    });

    await this.registrationRepository.save(registration);

    await this.notificationSender.sendRegistrationConfirmation({
      eventTitle: event.title,
      slotStartsAt: slot.startsAt,
      participantEmail: command.userEmail,
      participantFirstName: command.userFirstName,
      participantLastName: command.userLastName,
      additionalGuests: command.additionalGuests,
      adminEmail: command.adminEmail,
    });

    return registration;
  }
}
