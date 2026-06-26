import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PASSWORD_HASHER, TOKEN_SERVICE } from '../../shared/di-tokens';
import { Argon2Hasher } from './infrastructure/argon2-hasher';
import { JwtTokenService } from './infrastructure/jwt-token.service';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/jwt-auth.guard';
import { RolesGuard } from './infrastructure/roles.guard';
import { SeedSuperadminService } from './infrastructure/seed-superadmin';
import { RegisterUseCase } from './application/usecases/register.usecase';
import { LoginUseCase } from './application/usecases/login.usecase';
import { RefreshUseCase } from './application/usecases/refresh.usecase';
import { GetMeUseCase } from './application/usecases/get-me.usecase';
import { AuthController } from './interface/http/auth.controller';

@Module({
  imports: [PassportModule, JwtModule.register({}), UserModule, NotificationsModule],
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: Argon2Hasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    RegisterUseCase,
    LoginUseCase,
    RefreshUseCase,
    GetMeUseCase,
    SeedSuperadminService,
  ],
  controllers: [AuthController],
  exports: [PASSWORD_HASHER, TOKEN_SERVICE, JwtAuthGuard, RolesGuard],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly seedSuperadminService: SeedSuperadminService) {}

  async onModuleInit(): Promise<void> {
    await this.seedSuperadminService.seedSuperadmin();
  }
}
