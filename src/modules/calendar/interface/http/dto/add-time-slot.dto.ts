import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddTimeSlotDto {
  @ApiProperty({ example: '2026-09-01T09:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiPropertyOptional({ example: '2026-09-01T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ example: 'Gruppe A' })
  @IsOptional()
  @IsString()
  label?: string;
}
