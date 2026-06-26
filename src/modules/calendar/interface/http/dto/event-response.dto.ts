import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventKind } from '../../../domain/event-kind.vo';

export class ScheduleResponseDto {
  @ApiProperty() startsAt: Date;
  @ApiProperty() endsAt: Date;
  @ApiProperty() allDay: boolean;
}

export class TimeSlotResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() startsAt: Date;
  @ApiPropertyOptional() endsAt: Date | null;
  @ApiProperty() capacity: number;
  @ApiPropertyOptional() label: string | null;
  @ApiProperty() createdAt: Date;
}

export class EventResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: EventKind }) kind: EventKind;
  @ApiProperty({ type: ScheduleResponseDto }) schedule: ScheduleResponseDto;
  @ApiProperty({ type: [TimeSlotResponseDto] }) slots: TimeSlotResponseDto[];
  @ApiProperty() createdBy: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedEventsResponseDto {
  @ApiProperty({ type: [EventResponseDto] }) items: EventResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() pages: number;
}
