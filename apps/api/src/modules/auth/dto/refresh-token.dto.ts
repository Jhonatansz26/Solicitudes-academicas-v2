import { IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'Refresh token from HTTP-only cookie (auto-sent by browser)',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString()
  refreshToken: string;
}
