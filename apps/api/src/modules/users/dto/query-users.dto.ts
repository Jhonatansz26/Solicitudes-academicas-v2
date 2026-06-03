import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre o número de documento',
    example: 'Pérez',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por rol',
    enum: RoleName,
    example: 'STUDENT',
  })
  @IsEnum(RoleName)
  @IsOptional()
  role?: RoleName;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

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
