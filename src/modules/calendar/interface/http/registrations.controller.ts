import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RegisterToSlotUseCase } from '../../application/usecases/register-to-slot.usecase';
import { CancelRegistrationUseCase } from '../../application/usecases/cancel-registration.usecase';
import { GetUserUseCase } from '../../../user/application/usecases/get-user.usecase';
import { RegisterDto } from './dto/register.dto';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { DomainError } from '../../../../shared/domain/domain-error';

@ApiTags('Registrations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('events/:eventId')
export class RegistrationsController {
  constructor(
    private readonly registerToSlotUseCase: RegisterToSlotUseCase,
    private readonly cancelRegistrationUseCase: CancelRegistrationUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Записаться на слот события' })
  @ApiParam({ name: 'eventId', description: 'UUID события' })
  @ApiResponse({ status: 201, type: RegistrationResponseDto })
  @ApiNotFoundResponse({ description: 'Событие или слот не найден' })
  @ApiBadRequestResponse({ description: 'Событие — анонс, нет мест, или уже записан' })
  async register(
    @Param('eventId') eventId: string,
    @Body() dto: RegisterDto,
    @Request() req: any,
  ): Promise<RegistrationResponseDto> {
    const userId: string = req.user.userId;
    const user = await this.getUserUseCase.execute(userId);
    const adminEmail = this.configService.get<string>('superadmin.email') ?? '';

    try {
      const registration = await this.registerToSlotUseCase.execute({
        eventId,
        slotId: dto.slotId,
        userId,
        userEmail: user.email.value,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        additionalGuests: dto.additionalGuests,
        adminEmail,
      });

      return {
        id: registration.id,
        eventId: registration.eventId,
        slotId: registration.slotId,
        userId: registration.userId,
        additionalGuests: registration.additionalGuests,
        createdAt: registration.createdAt,
      };
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Delete('register')
  @HttpCode(204)
  @ApiOperation({ summary: 'Отменить запись на событие' })
  @ApiParam({ name: 'eventId', description: 'UUID события' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'Запись не найдена' })
  async cancel(
    @Param('eventId') eventId: string,
    @Request() req: any,
  ): Promise<void> {
    await this.cancelRegistrationUseCase.execute({
      eventId,
      userId: req.user.userId,
    });
  }
}
