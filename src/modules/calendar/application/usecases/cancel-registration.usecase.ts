import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REGISTRATION_REPOSITORY } from '../../../../shared/di-tokens';
import type { RegistrationRepository } from '../../domain/registration.repository';

export interface CancelRegistrationCommand {
  eventId: string;
  userId: string;
}

@Injectable()
export class CancelRegistrationUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(command: CancelRegistrationCommand): Promise<void> {
    const registration = await this.registrationRepository.findByEventAndUser(
      command.eventId,
      command.userId,
    );
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    await this.registrationRepository.delete(registration.id);
  }
}
