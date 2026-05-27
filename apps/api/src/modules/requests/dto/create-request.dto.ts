import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ description: 'ID of the request type' })
  @IsString()
  @IsNotEmpty()
  requestTypeId: string;

  @ApiProperty({ description: 'Request title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Optional description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
