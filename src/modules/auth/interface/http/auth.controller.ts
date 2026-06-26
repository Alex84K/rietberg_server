import {
  Controller, Post, Get, Body, UseGuards, Request,
  BadRequestException, UnauthorizedException, HttpCode,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiBody, ApiResponse, ApiUnauthorizedResponse, ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RegisterUseCase, RegisterCommand } from '../../application/usecases/register.usecase';
import { LoginUseCase, LoginCommand } from '../../application/usecases/login.usecase';
import { RefreshUseCase } from '../../application/usecases/refresh.usecase';
import { GetMeUseCase } from '../../application/usecases/get-me.usecase';
import { JwtAuthGuard } from '../../infrastructure/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { TokensDto, AuthWithUserDto, MeDto } from './dto/auth-response.dto';
import { DomainError } from '../../../../shared/domain/domain-error';
import { User } from '../../../user/domain/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: AuthWithUserDto })
  @ApiBadRequestResponse({ description: 'Невалидные поля или email уже существует' })
  async register(@Body() dto: RegisterDto): Promise<AuthWithUserDto> {
    const { tokens, user } = await this.registerUseCase.execute(
      new RegisterCommand(dto.email, dto.password, dto.firstName, dto.lastName, dto.phone),
    );
    return { ...tokens, user: this.toMeDto(user) };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Вход по email + пароль' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: AuthWithUserDto })
  @ApiBadRequestResponse({ description: 'Неверный email или пароль' })
  async login(@Body() dto: LoginDto): Promise<AuthWithUserDto> {
    try {
      const { tokens, user } = await this.loginUseCase.execute(
        new LoginCommand(dto.email, dto.password),
      );
      return { ...tokens, user: this.toMeDto(user) };
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Обновление access-токена' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, type: TokensDto })
  @ApiBadRequestResponse({ description: 'Невалидный или просроченный refresh-токен' })
  async refresh(@Body() dto: RefreshDto): Promise<TokensDto> {
    try {
      return await this.refreshUseCase.execute(dto.refreshToken);
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Текущий пользователь' })
  @ApiResponse({ status: 200, type: MeDto })
  @ApiUnauthorizedResponse({ description: 'Токен отсутствует или просрочен' })
  async getMe(@Request() req: any): Promise<MeDto> {
    const user = await this.getMeUseCase.execute(req.user.userId);
    return this.toMeDto(user);
  }

  private toMeDto(user: User): MeDto {
    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toString(),
    };
  }
}
