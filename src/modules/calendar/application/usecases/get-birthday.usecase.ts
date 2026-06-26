import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BIRTHDAY_REPOSITORY } from '../../../../shared/di-tokens';
import type { BirthdayRepository } from '../../domain/birthday.repository';
import { Birthday } from '../../domain/birthday.entity';

@Injectable()
export class GetBirthdayUseCase {
  constructor(
    @Inject(BIRTHDAY_REPOSITORY)
    private readonly birthdayRepository: BirthdayRepository,
  ) {}

  async execute(id: string): Promise<Birthday> {
    const birthday = await this.birthdayRepository.findById(id);
    if (!birthday) {
      throw new NotFoundException(`Birthday ${id} not found`);
    }
    return birthday;
  }
}
