import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    description: 'ID of the request type (Certificado, Homologación, etc.)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  requestTypeId: string;

  @ApiProperty({
    description: 'Title of the request',
    example: 'Solicitud de certificado de estudio',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Additional details or context for the request',
    example: 'Necesito el certificado para trámite de transferencia universitaria',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
