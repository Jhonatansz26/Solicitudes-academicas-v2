import {
  IsEmail,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'student@universidad.edu.co',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña inicial (mínimo 8 caracteres)',
    example: 'TempPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '1000000001',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  documentNumber: string;

  @ApiProperty({
    description: 'ID del rol a asignar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Programa académico (requerido para rol Estudiante)',
    example: 'Ingeniería de Sistemas',
  })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiPropertyOptional({
    description: 'Semestre actual (1-12, requerido para rol Estudiante)',
    example: 5,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  semester?: number;

  @ApiPropertyOptional({
    description:
      'Código estudiantil institucional (requerido para rol Estudiante)',
    example: '20240001',
  })
  @IsString()
  @IsOptional()
  studentCode?: string;
}
