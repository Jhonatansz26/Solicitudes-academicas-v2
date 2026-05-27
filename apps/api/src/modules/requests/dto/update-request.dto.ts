import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Updated request title',
    example: 'Solicitud de certificado de estudio - Urgente',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated request description',
    example: 'Se requiere con urgencia para fecha límite del viernes',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
