import { IsEmail, IsString, IsUUID, IsOptional, IsInt, Min, Max, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'student@universidad.edu.co',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'Juan Pérez',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'National identification document number',
    example: '1000000001',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional({
    description: 'ID of the role to assign',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({
    description: 'Academic program (required when changing to STUDENT role)',
    example: 'Ingeniería de Sistemas',
  })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiPropertyOptional({
    description: 'Current semester (1-12, required when changing to STUDENT role)',
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
    description: 'Student institutional code (required when changing to STUDENT role)',
    example: '20240001',
  })
  @IsString()
  @IsOptional()
  studentCode?: string;
}
