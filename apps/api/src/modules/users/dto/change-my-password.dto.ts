import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeMyPasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'OldPass123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters)',
    example: 'NewPass456!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
