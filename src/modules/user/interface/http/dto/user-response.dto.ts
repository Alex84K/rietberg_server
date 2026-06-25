import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'max.mustermann@example.de' })
  email: string;

  @ApiProperty({ example: 'Max' })
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  lastName: string;

  @ApiProperty({ example: '+49 123 4567890' })
  phone: string;

  @ApiProperty({ enum: ['USER', 'ADMIN'], example: 'USER' })
  role: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-15T09:30:00.000Z' })
  updatedAt: Date;
}
