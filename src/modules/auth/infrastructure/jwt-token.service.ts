import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { TokenPayload, TokenPair, TokenService } from '../application/ports/token-service.port';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: TokenPayload): Promise<TokenPair> {
    const accessSecret = (this.configService.get<string>('jwt.accessSecret') || 'access-secret-dev') as string;
    const refreshSecret = (this.configService.get<string>('jwt.refreshSecret') || 'refresh-secret-dev') as string;
    const accessExpires = this.configService.get<string>('jwt.accessExpires') || '15m';
    const refreshExpires = this.configService.get<string>('jwt.refreshExpires') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: accessSecret,
        expiresIn: accessExpires,
      } as any),
      this.jwtService.signAsync(payload as any, {
        secret: refreshSecret,
        expiresIn: refreshExpires,
      } as any),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const accessSecret = (this.configService.get<string>('jwt.accessSecret') || 'access-secret-dev') as string;
    return this.jwtService.verifyAsync(token, {
      secret: accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const refreshSecret = (this.configService.get<string>('jwt.refreshSecret') || 'refresh-secret-dev') as string;
    return this.jwtService.verifyAsync(token, {
      secret: refreshSecret,
    });
  }
}
