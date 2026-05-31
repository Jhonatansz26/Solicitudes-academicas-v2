import { IsEmail, IsString, IsUUID, IsOptional, IsInt, Min, Max, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'student@universidad.edu.co',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Initial password (minimum 8 characters)',
    example: 'TempPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Juan Pérez',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({
    description: 'National identification document number',
    example: '1000000001',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  documentNumber: string;

  @ApiProperty({
    description: 'ID of the role to assign',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Academic program (required for STUDENT role)',
    example: 'Ingeniería de Sistemas',
  })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiPropertyOptional({
    description: 'Current semester (1-12, required for STUDENT role)',
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
    description: 'Student institutional code (required for STUDENT role)',
    example: '20240001',
  })
  @IsString()
  @IsOptional()
  studentCode?: string;
}
