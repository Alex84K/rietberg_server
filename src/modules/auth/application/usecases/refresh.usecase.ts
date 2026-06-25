import { Inject, Injectable } from '@nestjs/common';
import type { TokenService, TokenPair, TokenPayload } from '../ports/token-service.port';
import { TOKEN_SERVICE } from '../../../../shared/di-tokens';
import { DomainError } from '../../../../shared/domain/domain-error';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const tokens = await this.tokenService.generateTokens(payload);
      return tokens;
    } catch (error) {
      throw new DomainError('Invalid refresh token');
    }
  }
}
