import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { USER_REPOSITORY } from '../../../../shared/di-tokens';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return user;
  }
}
