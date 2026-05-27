import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTooManyRequestsResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Authenticate user and receive tokens',
    description: 'Validates credentials and returns an access token plus a refresh token stored in an HTTP-only cookie.',
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'student@universidad.edu.co',
          fullName: 'Juan Pérez',
          role: 'STUDENT',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiForbiddenResponse({ description: 'Account is inactive or suspended' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts — max 5 per minute' })
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Uses the HTTP-only refresh token cookie to issue a new access token.',
  })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIs...' } },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates the refresh token and clears the HTTP-only cookie.',
  })
  @ApiOkResponse({
    description: 'Logged out successfully',
    schema: { example: { message: 'Logged out successfully' } },
  })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile including role and student profile if available.',
  })
  @ApiOkResponse({
    description: 'User profile returned',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'student@universidad.edu.co',
        fullName: 'Juan Pérez',
        documentNumber: '1000000001',
        role: 'STUDENT',
        isActive: true,
        studentProfile: {
          program: 'Ingeniería de Sistemas',
          semester: 5,
          studentCode: '20240001',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  me(@Req() req: Request & { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }
}
