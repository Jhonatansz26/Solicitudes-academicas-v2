import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
    example: 'student@universidad.edu.co',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
