import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'max.mustermann@example.de' })
  email: string;

  @ApiProperty({ example: 'Max' })
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  lastName: string;

  @ApiProperty({ enum: ['USER', 'ADMIN'], example: 'USER' })
  role: string;
}

export class TokensDto {
  @ApiProperty({ description: 'JWT Access Token (15 min)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token (7 days)' })
  refreshToken: string;
}

export class AuthWithUserDto {
  @ApiProperty({ description: 'JWT Access Token (15 min)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT Refresh Token (7 days)' })
  refreshToken: string;

  @ApiProperty({ type: MeDto })
  user: MeDto;
}
