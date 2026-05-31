import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRequestTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the request type',
    example: 'Certificado',
    minLength: 1,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the request type',
    example: 'Solicitud de certificado académico',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estimated number of days to process this type of request',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDays?: number;
}
