import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Si la cuenta está activa (true) o desactivada (false)',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
