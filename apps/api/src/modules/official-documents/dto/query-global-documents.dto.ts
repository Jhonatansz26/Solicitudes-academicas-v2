import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OfficialDocumentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryGlobalDocumentsDto {
  @ApiPropertyOptional({ description: 'Página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Tipo de documento',
    enum: OfficialDocumentType,
  })
  @IsOptional()
  @IsEnum(OfficialDocumentType)
  type?: OfficialDocumentType;

  @ApiPropertyOptional({
    description: 'Búsqueda por título, tracking o generador',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
