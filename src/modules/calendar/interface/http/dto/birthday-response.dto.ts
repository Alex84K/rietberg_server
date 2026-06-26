import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BirthdayResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() birthDate: Date;
  @ApiPropertyOptional() note: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class BirthdayOccurrenceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() birthDate: Date;
  @ApiPropertyOptional() note: string | null;
  @ApiProperty({ description: 'Projected occurrence date in the requested range' })
  occurrenceDate: Date;
  @ApiProperty({ description: 'Age in the occurrence year' })
  age: number;
}
