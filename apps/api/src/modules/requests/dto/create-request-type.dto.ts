import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de solicitud',
    example: 'Certificado',
    minLength: 1,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de solicitud',
    example: 'Solicitud de certificado académico',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Días estimados para procesar este tipo de solicitud',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  estimatedDays: number;
}
