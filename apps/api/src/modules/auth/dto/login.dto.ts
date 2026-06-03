import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'student@universidad.edu.co',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres)',
    example: 'MySecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
