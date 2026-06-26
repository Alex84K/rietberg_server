import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BIRTHDAY_REPOSITORY } from '../../../../shared/di-tokens';
import type { BirthdayRepository } from '../../domain/birthday.repository';

@Injectable()
export class DeleteBirthdayUseCase {
  constructor(
    @Inject(BIRTHDAY_REPOSITORY)
    private readonly birthdayRepository: BirthdayRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const birthday = await this.birthdayRepository.findById(id);
    if (!birthday) {
      throw new NotFoundException(`Birthday ${id} not found`);
    }
    await this.birthdayRepository.delete(id);
  }
}
