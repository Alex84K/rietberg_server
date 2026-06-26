import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'b1c2d3e4-...' })
  @IsUUID()
  slotId: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  additionalGuests: number = 0;
}
