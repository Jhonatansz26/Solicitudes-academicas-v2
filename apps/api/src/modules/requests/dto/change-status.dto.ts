import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'New status to assign to the request',
    enum: RequestStatus,
    example: 'IN_REVIEW',
  })
  @IsEnum(RequestStatus)
  newStatus: RequestStatus;

  @ApiPropertyOptional({
    description: 'Comment explaining the status change (required when status is REJECTED)',
    example: 'Documentación incompleta, falta récord académico',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.newStatus === 'REJECTED')
  comment?: string;
}
