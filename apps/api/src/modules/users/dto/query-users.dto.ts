import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Search by full name or document number',
    example: 'Pérez',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role name',
    enum: RoleName,
    example: 'STUDENT',
  })
  @IsEnum(RoleName)
  @IsOptional()
  role?: RoleName;

  @ApiPropertyOptional({
    description: 'Filter by active/inactive status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

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
  @Max(100)
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
