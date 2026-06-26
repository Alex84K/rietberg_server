import { Inject, Injectable } from '@nestjs/common';
import type { PasswordHasher } from '../ports/password-hasher.port';
import type { TokenService, TokenPair } from '../ports/token-service.port';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from '../../../../shared/di-tokens';
import type { UserRepository } from '../../../user/domain/user.repository';
import { User } from '../../../user/domain/user.entity';
import { DomainError } from '../../../../shared/domain/domain-error';

export interface LoginResult {
  tokens: TokenPair;
  user: User;
}

export class LoginCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new DomainError('Invalid email or password');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new DomainError('Invalid email or password');
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email.value,
      role: user.role.toString(),
    });

    return { tokens, user };
  }
}
