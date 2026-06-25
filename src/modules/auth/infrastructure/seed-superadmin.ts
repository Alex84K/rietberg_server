import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../../shared/di-tokens';
import type { UserRepository } from '../../user/domain/user.repository';
import type { PasswordHasher } from '../application/ports/password-hasher.port';
import { User } from '../../user/domain/user.entity';
import { Role } from '../../user/domain/role.vo';

@Injectable()
export class SeedSuperadminService {
  private readonly logger = new Logger(SeedSuperadminService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService,
  ) {}

  async seedSuperadmin(): Promise<void> {
    const email = this.configService.get<string>('superadmin.email');
    const password = this.configService.get<string>('superadmin.password');

    if (!email || !password) {
      this.logger.warn('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set — skipping seed');
      return;
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      this.logger.log(`Superadmin ${email} already exists`);
      return;
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const superadmin = User.create({ email, passwordHash, firstName: 'Super', lastName: 'Admin', role: Role.admin() });

    await this.userRepository.create(superadmin);
    this.logger.log(`✅ Superadmin ${email} created (id: ${superadmin.id})`);
  }
}
