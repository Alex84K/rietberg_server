import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiResponse, ApiNotFoundResponse, ApiForbiddenResponse,
  ApiParam, ApiBody,
} from '@nestjs/swagger';
import { ListUsersUseCase } from '../../application/usecases/list-users.usecase';
import { GetUserUseCase } from '../../application/usecases/get-user.usecase';
import { UpdateUserUseCase, UpdateUserCommand } from '../../application/usecases/update-user.usecase';
import { DeleteUserUseCase } from '../../application/usecases/delete-user.usecase';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Role, RoleType } from '../../domain/role.vo';
import { User } from '../../domain/user.entity';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../../shared/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
@ApiForbiddenResponse({ description: 'Nur Admins haben Zugriff' })
@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список всех пользователей (ADMIN)', description: 'Возвращает всех пользователей системы. Требует роль ADMIN.' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async list(): Promise<UserResponseDto[]> {
    const users = await this.listUsersUseCase.execute();
    return users.map(this.toDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async get(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(id);
    return this.toDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить профиль или роль пользователя (ADMIN)', description: 'Обновляет только переданные поля. Для смены роли передай role: ADMIN или USER.' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const role = dto.role !== undefined ? new Role(dto.role) : undefined;
    const command = new UpdateUserCommand(id, dto.firstName, dto.lastName, dto.phone, role);
    const user = await this.updateUserUseCase.execute(command);
    return this.toDto(user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить пользователя (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({ status: 204, description: 'Пользователь удалён' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role.toString(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
