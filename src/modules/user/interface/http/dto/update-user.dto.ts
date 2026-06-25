import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { RoleType } from '../../../domain/role.vo';

export class UpdateUserDto {
  @ApiProperty({ example: 'Max', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Mustermann', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '+49 123 4567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: RoleType, example: RoleType.ADMIN, required: false, description: 'Nur Admins können Rollen ändern' })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}
