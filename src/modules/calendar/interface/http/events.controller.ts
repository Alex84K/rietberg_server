import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
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
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../../shared/guards/roles.guard';
import { RoleType } from '../../../user/domain/role.vo';
import { CreateEventUseCase } from '../../application/usecases/create-event.usecase';
import { GetEventUseCase } from '../../application/usecases/get-event.usecase';
import { ListEventsUseCase } from '../../application/usecases/list-events.usecase';
import { ListAllEventsUseCase } from '../../application/usecases/list-all-events.usecase';
import { DeleteEventUseCase } from '../../application/usecases/delete-event.usecase';
import { UpdateEventUseCase } from '../../application/usecases/update-event.usecase';
import { AddTimeSlotUseCase } from '../../application/usecases/add-time-slot.usecase';
import { DeleteTimeSlotUseCase } from '../../application/usecases/delete-time-slot.usecase';
import { ListSlotRegistrationsUseCase } from '../../application/usecases/list-slot-registrations.usecase';
import { ListSlotParticipantsUseCase } from '../../application/usecases/list-slot-participants.usecase';
import { GetMyRegistrationsUseCase } from '../../application/usecases/get-my-registrations.usecase';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AddTimeSlotDto } from './dto/add-time-slot.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  EventResponseDto,
  TimeSlotResponseDto,
  PaginatedEventsResponseDto,
} from './dto/event-response.dto';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { ParticipantResponseDto } from './dto/participant-response.dto';
import { MyRegistrationResponseDto } from './dto/my-registration-response.dto';
import { Event } from '../../domain/event.aggregate';
import { Registration } from '../../domain/registration.entity';
import { DomainError } from '../../../../shared/domain/domain-error';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getEventUseCase: GetEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly listAllEventsUseCase: ListAllEventsUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly addTimeSlotUseCase: AddTimeSlotUseCase,
    private readonly deleteTimeSlotUseCase: DeleteTimeSlotUseCase,
    private readonly listSlotRegistrationsUseCase: ListSlotRegistrationsUseCase,
    private readonly listSlotParticipantsUseCase: ListSlotParticipantsUseCase,
    private readonly getMyRegistrationsUseCase: GetMyRegistrationsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список событий в диапазоне дат (календарный вид)' })
  @ApiResponse({ status: 200, type: [EventResponseDto] })
  async list(@Query() query: DateRangeQueryDto): Promise<EventResponseDto[]> {
    const events = await this.listEventsUseCase.execute({
      from: new Date(query.from),
      to: new Date(query.to),
    });
    return events.map((e) => this.toDto(e));
  }

  // Declared before GET :id to avoid NestJS treating "all" as an :id param
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({
    summary: 'Все события с пагинацией (ADMIN)',
    description: 'Возвращает полный список событий, отсортированных по дате начала (новые первые). Используется в админ-панели.',
  })
  @ApiResponse({ status: 200, type: PaginatedEventsResponseDto })
  async listAll(@Query() query: PaginationQueryDto): Promise<PaginatedEventsResponseDto> {
    const result = await this.listAllEventsUseCase.execute({
      page: query.page,
      limit: query.limit,
    });
    return {
      items: result.items.map((e) => this.toDto(e)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    };
  }

  @Get('users/registrations')
  @ApiOperation({ summary: 'Мои записи на события (текущий пользователь)' })
  @ApiResponse({ status: 200, type: [MyRegistrationResponseDto] })
  async getMyRegistrations(@Request() req: any): Promise<MyRegistrationResponseDto[]> {
    return this.getMyRegistrationsUseCase.execute(req.user.userId);
  }

  @Get('slots/:slotId/registrations')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Записи на слот — сырые данные (ADMIN)' })
  @ApiParam({ name: 'slotId', description: 'UUID слота' })
  @ApiResponse({ status: 200, type: [RegistrationResponseDto] })
  async listSlotRegistrations(
    @Param('slotId') slotId: string,
    @Query('eventId') eventId: string,
  ): Promise<RegistrationResponseDto[]> {
    const registrations = await this.listSlotRegistrationsUseCase.execute(eventId, slotId);
    return registrations.map((r) => this.toRegistrationDto(r));
  }

  @Get('slots/:slotId/participants')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Список участников слота с данными пользователей (ADMIN)' })
  @ApiParam({ name: 'slotId', description: 'UUID слота' })
  @ApiResponse({ status: 200, type: [ParticipantResponseDto] })
  @ApiNotFoundResponse({ description: 'Событие или слот не найден' })
  async listSlotParticipants(
    @Param('slotId') slotId: string,
    @Query('eventId') eventId: string,
  ): Promise<ParticipantResponseDto[]> {
    return this.listSlotParticipantsUseCase.execute(eventId, slotId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить событие по ID' })
  @ApiParam({ name: 'id', description: 'UUID события' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Событие не найдено' })
  async get(@Param('id') id: string): Promise<EventResponseDto> {
    const event = await this.getEventUseCase.execute(id);
    return this.toDto(event);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(201)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Создать событие (ADMIN)' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Невалидные данные или нарушение доменного инварианта' })
  async create(@Body() dto: CreateEventDto, @Request() req: any): Promise<EventResponseDto> {
    try {
      const event = await this.createEventUseCase.execute({
        title: dto.title,
        description: dto.description,
        kind: dto.kind,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        allDay: dto.allDay,
        createdBy: req.user.userId,
      });
      return this.toDto(event);
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(204)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Удалить событие и все записи (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID события' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'Событие не найдено' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteEventUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Обновить событие (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID события' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Невалидные данные или нарушение доменного инварианта' })
  @ApiNotFoundResponse({ description: 'Событие не найдено' })
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto): Promise<EventResponseDto> {
    const event = await this.updateEventUseCase.execute({
      id,
      title: dto.title,
      description: dto.description,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      allDay: dto.allDay,
    });
    return this.toDto(event);
  }

  @Post(':id/slots')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(201)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Добавить слот к событию (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID события' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  @ApiBadRequestResponse({ description: 'Нельзя добавить слот к ANNOUNCEMENT' })
  async addSlot(@Param('id') id: string, @Body() dto: AddTimeSlotDto): Promise<EventResponseDto> {
    try {
      const event = await this.addTimeSlotUseCase.execute({
        eventId: id,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        capacity: dto.capacity,
        label: dto.label,
      });
      return this.toDto(event);
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Delete('slots/:slotId')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(204)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Удалить слот события (ADMIN)' })
  @ApiParam({ name: 'slotId', description: 'UUID слота' })
  @ApiResponse({ status: 204 })
  async deleteSlot(
    @Param('slotId') slotId: string,
    @Query('eventId') eventId: string,
  ): Promise<void> {
    try {
      await this.deleteTimeSlotUseCase.execute({ eventId, slotId });
    } catch (error) {
      if (error instanceof DomainError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  private toDto(event: Event): EventResponseDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      kind: event.kind,
      schedule: {
        startsAt: event.schedule.startsAt,
        endsAt: event.schedule.endsAt,
        allDay: event.schedule.allDay,
      },
      slots: event.slots.map((s): TimeSlotResponseDto => ({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        capacity: s.capacity,
        label: s.label,
        createdAt: s.createdAt,
      })),
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private toRegistrationDto(r: Registration): RegistrationResponseDto {
    return {
      id: r.id,
      eventId: r.eventId,
      slotId: r.slotId,
      userId: r.userId,
      additionalGuests: r.additionalGuests,
      createdAt: r.createdAt,
    };
  }
}
