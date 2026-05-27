import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryRequestsDto {
  @ApiPropertyOptional({
    description: 'Filter by request status',
    enum: RequestStatus,
    example: 'SUBMITTED',
  })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @ApiPropertyOptional({
    description: 'Filter by request type ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  requestTypeId?: string;

  @ApiPropertyOptional({
    description: 'Search by request title or student full name',
    example: 'certificado',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
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
    description: 'Items per page (max 100)',
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
