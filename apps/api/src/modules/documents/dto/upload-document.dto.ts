import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ description: 'ID of the request to attach the file to' })
  @IsUUID()
  @IsNotEmpty()
  requestId: string;
}
