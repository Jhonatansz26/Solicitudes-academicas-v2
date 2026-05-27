import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'ID of the request to attach the file to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  requestId: string;
}
