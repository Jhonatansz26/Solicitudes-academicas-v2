import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeMyPasswordDto {
  @ApiProperty({
    description: 'Contraseña actual para verificación',
    example: 'OldPass123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'NewPass456!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
