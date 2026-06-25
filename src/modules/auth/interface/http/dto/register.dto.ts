import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'max.mustermann@example.de', description: 'E-Mail-Adresse (wird kleingeschrieben gespeichert)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MeinPasswort1!', minLength: 8, description: 'Mindestens 8 Zeichen' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Max' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mustermann' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+49 123 4567890', description: 'Telefonnummer (optional)' })
  @IsString()
  phone: string;
}
