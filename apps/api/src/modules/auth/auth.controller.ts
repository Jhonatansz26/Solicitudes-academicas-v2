import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
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
    summary: 'Autenticar usuario y obtener tokens',
    description:
      'Valida las credenciales y retorna un token de acceso junto con un token de renovación almacenado en una cookie HTTP-only.',
  })
  @ApiOkResponse({
    description: 'Inicio de sesión exitoso',
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
  @ApiUnauthorizedResponse({ description: 'Correo o contraseña inválidos' })
  @ApiForbiddenResponse({ description: 'La cuenta está inactiva o suspendida' })
  @ApiTooManyRequestsResponse({
    description: 'Demasiados intentos de inicio de sesión — máx. 5 por minuto',
  })
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar token de acceso',
    description:
      'Utiliza la cookie HTTP-only de token de renovación para emitir un nuevo token de acceso.',
  })
  @ApiOkResponse({
    description: 'Token renovado exitosamente',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIs...' } },
  })
  @ApiUnauthorizedResponse({
    description: 'Token de renovación inválido o expirado',
  })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Invalida el token de renovación y elimina la cookie HTTP-only.',
  })
  @ApiOkResponse({
    description: 'Sesión cerrada exitosamente',
    schema: { example: { message: 'Sesión cerrada exitosamente' } },
  })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener perfil del usuario actual',
    description:
      'Retorna el perfil del usuario autenticado incluyendo rol y perfil estudiantil si está disponible.',
  })
  @ApiOkResponse({
    description: 'Perfil del usuario obtenido',
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
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  me(@Req() req: Request & { user: { id: string } }) {
    return this.authService.getProfile(req.user.id);
  }
}
