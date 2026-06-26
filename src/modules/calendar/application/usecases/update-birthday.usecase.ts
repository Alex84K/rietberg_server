import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BIRTHDAY_REPOSITORY } from '../../../../shared/di-tokens';
import type { BirthdayRepository } from '../../domain/birthday.repository';
import { Birthday } from '../../domain/birthday.entity';

export interface UpdateBirthdayCommand {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  note?: string;
}

@Injectable()
export class UpdateBirthdayUseCase {
  constructor(
    @Inject(BIRTHDAY_REPOSITORY)
    private readonly birthdayRepository: BirthdayRepository,
  ) {}

  async execute(command: UpdateBirthdayCommand): Promise<Birthday> {
    const birthday = await this.birthdayRepository.findById(command.id);
    if (!birthday) {
      throw new NotFoundException(`Birthday ${command.id} not found`);
    }
    const updated = birthday.update(
      command.firstName,
      command.lastName,
      command.birthDate,
      command.note,
    );
    await this.birthdayRepository.save(updated);
    return updated;
  }
}
