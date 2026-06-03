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
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
    example: 'student@universidad.edu.co',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

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
    description: 'Número de documento de identidad',
    example: '1000000001',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional({
    description: 'ID del rol a asignar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Programa académico (requerido al cambiar a rol Estudiante)',
    example: 'Ingeniería de Sistemas',
  })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiPropertyOptional({
    description:
      'Semestre actual (1-12, requerido al cambiar a rol Estudiante)',
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
      'Código estudiantil institucional (requerido al cambiar a rol Estudiante)',
    example: '20240001',
  })
  @IsString()
  @IsOptional()
  studentCode?: string;
}
