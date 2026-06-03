import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Nuevo estado para la solicitud',
    enum: RequestStatus,
    example: 'IN_REVIEW',
  })
  @IsEnum(RequestStatus)
  newStatus: RequestStatus;

  @ApiPropertyOptional({
    description:
      'Comentario explicando el cambio de estado (requerido al rechazar)',
    example: 'Documentación incompleta, falta récord académico',
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.newStatus === 'REJECTED')
  comment?: string;
}
