import { Inject, Injectable } from '@nestjs/common';
import type { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { USER_REPOSITORY } from '../../../../shared/di-tokens';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
