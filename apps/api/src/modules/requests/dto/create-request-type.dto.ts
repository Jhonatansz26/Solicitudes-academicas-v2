import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestTypeDto {
  @ApiProperty({
    description: 'Name of the request type',
    example: 'Certificado',
    minLength: 1,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the request type',
    example: 'Solicitud de certificado académico',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Estimated number of days to process this type of request',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  estimatedDays: number;
}
