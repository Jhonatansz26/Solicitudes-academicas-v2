import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestTypeDto {
  @ApiPropertyOptional({
    description: 'Nombre del tipo de solicitud',
    example: 'Certificado',
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de solicitud',
    example: 'Solicitud de certificado académico',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Días estimados para procesar este tipo de solicitud',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDays?: number;
}
