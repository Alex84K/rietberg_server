import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBirthdayDto {
  @ApiProperty({ example: 'Klaus' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Müller' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ example: '1965-03-15', description: 'ISO date string (YYYY-MM-DD), UTC' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ example: 'Ehemann von Erika' })
  @IsOptional()
  @IsString()
  note?: string;
}
