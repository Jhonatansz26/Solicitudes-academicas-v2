import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestDto {
  @ApiProperty({ description: 'Request title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Request description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
