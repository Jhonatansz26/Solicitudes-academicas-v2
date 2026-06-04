import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfficialDocumentType } from '@prisma/client';

export class GenerateDocumentDto {
  @ApiProperty({
    description: 'Tipo de documento oficial a generar',
    enum: OfficialDocumentType,
    example: 'CERTIFICATE',
  })
  @IsEnum(OfficialDocumentType)
  @IsNotEmpty()
  type: OfficialDocumentType;

  @ApiPropertyOptional({
    description: 'Notas internas sobre la generación',
    example: 'Regenerado por corrección de datos del estudiante',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
