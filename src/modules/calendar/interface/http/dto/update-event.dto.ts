import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDateString, IsOptional, MinLength } from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Herbstfest 2026 (aktualisiert)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'Jährliches Herbstfest des CBG-Rietberg' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-09-01T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-09-01T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;
}
