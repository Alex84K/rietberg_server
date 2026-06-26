import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsBoolean, IsDateString, IsOptional, MinLength } from 'class-validator';
import { EventKind } from '../../../domain/event-kind.vo';

export class CreateEventDto {
  @ApiProperty({ example: 'Herbstfest 2026' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: 'Jährliches Herbstfest des CBG-Rietberg' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventKind, example: EventKind.REGISTRABLE })
  @IsEnum(EventKind)
  kind: EventKind;

  @ApiProperty({ example: '2026-09-01T08:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2026-09-01T18:00:00.000Z' })
  @IsDateString()
  endsAt: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  allDay: boolean;
}
