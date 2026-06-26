import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventKind } from '../../../domain/event-kind.vo';

class MyRegistrationScheduleDto {
  @ApiProperty() startsAt: Date;
  @ApiProperty() endsAt: Date;
  @ApiProperty() allDay: boolean;
}

export class MyRegistrationResponseDto {
  @ApiProperty() registrationId: string;
  @ApiProperty() eventId: string;
  @ApiProperty() eventTitle: string;
  @ApiProperty({ enum: EventKind }) eventKind: EventKind;
  @ApiProperty({ type: MyRegistrationScheduleDto }) schedule: MyRegistrationScheduleDto;
  @ApiProperty() slotId: string;
  @ApiProperty() slotStartsAt: Date;
  @ApiPropertyOptional() slotEndsAt: Date | null;
  @ApiPropertyOptional() slotLabel: string | null;
  @ApiProperty() slotCapacity: number;
  @ApiProperty() additionalGuests: number;
  @ApiProperty() registeredAt: Date;
}
