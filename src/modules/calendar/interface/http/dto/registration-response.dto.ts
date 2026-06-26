import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() eventId: string;
  @ApiProperty() slotId: string;
  @ApiProperty() userId: string;
  @ApiProperty() additionalGuests: number;
  @ApiProperty() createdAt: Date;
}
