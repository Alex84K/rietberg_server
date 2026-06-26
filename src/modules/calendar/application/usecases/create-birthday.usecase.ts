import { Inject, Injectable } from '@nestjs/common';
import { BIRTHDAY_REPOSITORY } from '../../../../shared/di-tokens';
import type { BirthdayRepository } from '../../domain/birthday.repository';
import { Birthday } from '../../domain/birthday.entity';

export interface CreateBirthdayCommand {
  firstName: string;
  lastName: string;
  birthDate: Date;
  note?: string;
}

@Injectable()
export class CreateBirthdayUseCase {
  constructor(
    @Inject(BIRTHDAY_REPOSITORY)
    private readonly birthdayRepository: BirthdayRepository,
  ) {}

  async execute(command: CreateBirthdayCommand): Promise<Birthday> {
    const birthday = Birthday.create({
      firstName: command.firstName,
      lastName: command.lastName,
      birthDate: command.birthDate,
      note: command.note,
    });
    await this.birthdayRepository.save(birthday);
    return birthday;
  }
}
