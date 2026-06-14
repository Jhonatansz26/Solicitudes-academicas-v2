import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiPropertyOptional({
    description:
      'ID del estudiante para quien se crea la solicitud. Solo ADMIN puede especificarlo; STUDENT siempre crea para sí mismo.',
    example: '833ffbbd-dba0-4a6e-8a16-365c882feca4',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'ID del tipo de solicitud (Certificado, Homologación, etc.)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  requestTypeId: string;

  @ApiProperty({
    description: 'Título de la solicitud',
    example: 'Solicitud de certificado de estudio',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Detalles adicionales de la solicitud',
    example:
      'Necesito el certificado para trámite de transferencia universitaria',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
