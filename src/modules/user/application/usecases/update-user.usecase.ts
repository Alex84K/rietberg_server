import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';
import { Role } from '../../domain/role.vo';
import { USER_REPOSITORY } from '../../../../shared/di-tokens';

export class UpdateUserCommand {
  constructor(
    readonly userId: string,
    readonly firstName?: string,
    readonly lastName?: string,
    readonly phone?: string,
    readonly role?: Role,
  ) {}
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) throw new NotFoundException(`User ${command.userId} not found`);

    let updated = user;

    const hasProfileUpdate =
      command.firstName !== undefined ||
      command.lastName !== undefined ||
      command.phone !== undefined;

    if (hasProfileUpdate) {
      updated = updated.updateProfile(
        command.firstName ?? user.firstName,
        command.lastName ?? user.lastName,
        command.phone ?? user.phone,
      );
    }

    if (command.role !== undefined) {
      updated = updated.updateRole(command.role);
    }

    await this.userRepository.update(updated);
    return updated;
  }
}
