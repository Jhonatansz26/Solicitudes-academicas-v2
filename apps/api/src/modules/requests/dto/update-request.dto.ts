import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Título actualizado de la solicitud',
    example: 'Solicitud de certificado de estudio - Urgente',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción actualizada de la solicitud',
    example: 'Se requiere con urgencia para fecha límite del viernes',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
