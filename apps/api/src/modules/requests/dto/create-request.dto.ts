import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
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
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detalles adicionales de la solicitud',
    example:
      'Necesito el certificado para trámite de transferencia universitaria',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
