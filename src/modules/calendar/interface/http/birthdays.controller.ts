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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../../shared/guards/roles.guard';
import { RoleType } from '../../../user/domain/role.vo';
import { ListBirthdaysUseCase } from '../../application/usecases/list-birthdays.usecase';
import { GetBirthdayUseCase } from '../../application/usecases/get-birthday.usecase';
import { CreateBirthdayUseCase } from '../../application/usecases/create-birthday.usecase';
import { UpdateBirthdayUseCase } from '../../application/usecases/update-birthday.usecase';
import { DeleteBirthdayUseCase } from '../../application/usecases/delete-birthday.usecase';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { CreateBirthdayDto } from './dto/create-birthday.dto';
import { UpdateBirthdayDto } from './dto/update-birthday.dto';
import {
  BirthdayResponseDto,
  BirthdayOccurrenceResponseDto,
} from './dto/birthday-response.dto';
import { Birthday } from '../../domain/birthday.entity';

@ApiTags('Birthdays')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('birthdays')
export class BirthdaysController {
  constructor(
    private readonly listBirthdaysUseCase: ListBirthdaysUseCase,
    private readonly getBirthdayUseCase: GetBirthdayUseCase,
    private readonly createBirthdayUseCase: CreateBirthdayUseCase,
    private readonly updateBirthdayUseCase: UpdateBirthdayUseCase,
    private readonly deleteBirthdayUseCase: DeleteBirthdayUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Дни рождения в диапазоне дат',
    description:
      'Проецирует birthDate на год(а) диапазона. ' +
      '29 февраля в невисокосный год → 01 марта. Возвращает age в году вхождения.',
  })
  @ApiResponse({ status: 200, type: [BirthdayOccurrenceResponseDto] })
  async list(@Query() query: DateRangeQueryDto): Promise<BirthdayOccurrenceResponseDto[]> {
    return this.listBirthdaysUseCase.execute({
      from: new Date(query.from),
      to: new Date(query.to),
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(201)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Добавить день рождения (ADMIN)' })
  @ApiResponse({ status: 201, type: BirthdayResponseDto })
  async create(@Body() dto: CreateBirthdayDto): Promise<BirthdayResponseDto> {
    const birthday = await this.createBirthdayUseCase.execute({
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate),
      note: dto.note,
    });
    return this.toDto(birthday);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Обновить день рождения (ADMIN)', description: 'Передавай только изменяемые поля.' })
  @ApiParam({ name: 'id', description: 'UUID записи' })
  @ApiResponse({ status: 200, type: BirthdayResponseDto })
  @ApiNotFoundResponse({ description: 'Запись не найдена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBirthdayDto,
  ): Promise<BirthdayResponseDto> {
    const existing = await this.getBirthdayUseCase.execute(id);

    const birthday = await this.updateBirthdayUseCase.execute({
      id,
      firstName: dto.firstName ?? existing.firstName,
      lastName: dto.lastName ?? existing.lastName,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : existing.birthDate,
      note: dto.note !== undefined ? dto.note : (existing.note ?? undefined),
    });
    return this.toDto(birthday);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  @HttpCode(204)
  @ApiForbiddenResponse({ description: 'Nur Admins' })
  @ApiOperation({ summary: 'Удалить день рождения (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID записи' })
  @ApiResponse({ status: 204 })
  @ApiNotFoundResponse({ description: 'Запись не найдена' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteBirthdayUseCase.execute(id);
  }

  private toDto(b: Birthday): BirthdayResponseDto {
    return {
      id: b.id,
      firstName: b.firstName,
      lastName: b.lastName,
      birthDate: b.birthDate,
      note: b.note,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }
}
