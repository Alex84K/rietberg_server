import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'max.mustermann@example.de' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MeinPasswort1!' })
  @IsString()
  password: string;
}
