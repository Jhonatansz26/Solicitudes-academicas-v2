import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({ enum: RequestStatus, description: 'New status for the request' })
  @IsEnum(RequestStatus)
  newStatus: RequestStatus;

  @ApiProperty({ description: 'Comment (required when rejecting)', required: false })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.newStatus === 'REJECTED')
  comment?: string;
}
