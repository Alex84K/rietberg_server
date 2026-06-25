import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh-Token aus dem vorherigen Login/Register' })
  @IsString()
  refreshToken: string;
}
