import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DateRangeQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'ISO date string, inclusive' })
  @IsDateString()
  from: string;

  @ApiProperty({ example: '2026-12-31', description: 'ISO date string, inclusive' })
  @IsDateString()
  to: string;
}
