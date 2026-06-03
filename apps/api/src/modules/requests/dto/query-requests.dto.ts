import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryRequestsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de solicitud',
    enum: RequestStatus,
    example: 'SUBMITTED',
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de solicitud',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  requestTypeId?: string;

  @ApiPropertyOptional({
    description: 'Buscar por título o nombre del estudiante',
    example: 'certificado',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página (máx. 100)',
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsNumber()
  @Max(100)
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
