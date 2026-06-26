import { Inject, Injectable } from '@nestjs/common';
import { BIRTHDAY_REPOSITORY } from '../../../../shared/di-tokens';
import type { BirthdayRepository } from '../../domain/birthday.repository';
import { Birthday } from '../../domain/birthday.entity';

export interface BirthdayOccurrence {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  note: string | null;
  occurrenceDate: Date;
  age: number;
}

export interface ListBirthdaysQuery {
  from: Date;
  to: Date;
}

@Injectable()
export class ListBirthdaysUseCase {
  constructor(
    @Inject(BIRTHDAY_REPOSITORY)
    private readonly birthdayRepository: BirthdayRepository,
  ) {}

  async execute(query: ListBirthdaysQuery): Promise<BirthdayOccurrence[]> {
    const birthdays = await this.birthdayRepository.findAll();
    const fromYear = query.from.getFullYear();
    const toYear = query.to.getFullYear();

    const occurrences: BirthdayOccurrence[] = [];

    for (const birthday of birthdays) {
      const birthYear = birthday.birthDate.getFullYear();

      for (let year = fromYear; year <= toYear; year++) {
        if (year < birthYear) continue;

        const occurrence = this.projectToYear(birthday.birthDate, year);

        if (occurrence >= query.from && occurrence <= query.to) {
          occurrences.push({
            id: birthday.id,
            firstName: birthday.firstName,
            lastName: birthday.lastName,
            birthDate: birthday.birthDate,
            note: birthday.note,
            occurrenceDate: occurrence,
            age: year - birthYear,
          });
        }
      }
    }

    return occurrences.sort((a, b) => a.occurrenceDate.getTime() - b.occurrenceDate.getTime());
  }

  /** Projects a birthDate to a given year. Feb 29 in a non-leap year → Mar 1 (ADR-009). */
  private projectToYear(birthDate: Date, year: number): Date {
    const month = birthDate.getMonth();
    const day = birthDate.getDate();

    if (month === 1 && day === 29 && !this.isLeapYear(year)) {
      return new Date(Date.UTC(year, 2, 1)); // Mar 1
    }

    return new Date(Date.UTC(year, month, day));
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
}
