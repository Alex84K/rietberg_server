import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import type { PasswordHasher } from '../ports/password-hasher.port';
import type { TokenService, TokenPair } from '../ports/token-service.port';
import {
  PASSWORD_HASHER,
  TOKEN_SERVICE,
  USER_REPOSITORY,
  NOTIFICATION_SENDER,
} from '../../../../shared/di-tokens';
import type { UserRepository } from '../../../user/domain/user.repository';
import type { NotificationSender } from '../../../notifications/application/ports/notification-sender.port';
import { User } from '../../../user/domain/user.entity';
import { DomainError } from '../../../../shared/domain/domain-error';

export interface RegisterResult {
  tokens: TokenPair;
  user: User;
}

export class RegisterCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly phone?: string,
  ) {}
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(NOTIFICATION_SENDER) private readonly notificationSender: NotificationSender,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new BadRequestException(
        `User with email ${command.email} already exists`,
      );
    }

    const passwordHash = await this.passwordHasher.hash(command.password);

    let user: User;
    try {
      user = User.create({
        email: command.email,
        passwordHash,
        firstName: command.firstName,
        lastName: command.lastName,
        phone: command.phone,
      });
    } catch (error) {
      if (error instanceof DomainError)
        throw new BadRequestException(error.message);
      throw error;
    }

    await this.userRepository.create(user);

    void this.notificationSender
      .sendWelcome({
        recipientEmail: user.email.value,
        firstName: user.firstName,
        lastName: user.lastName,
      })
      .catch(() => {});

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email.value,
      role: user.role.toString(),
    });

    return { tokens, user };
  }
}
