import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Whether the user account is active (true) or deactivated (false)',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
