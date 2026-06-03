import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { ChangeMyPasswordDto } from './dto/change-my-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obtener mi perfil',
    description:
      'Retorna el perfil del usuario autenticado incluyendo rol y perfil estudiantil.',
  })
  @ApiOkResponse({ description: 'Perfil del usuario' })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMyProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualizar mi perfil',
    description:
      'Actualiza el nombre completo y/o correo del usuario autenticado.',
  })
  @ApiOkResponse({ description: 'Perfil actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Cuerpo de solicitud inválido' })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.usersService.updateMyProfile(req.user.id, dto);
  }

  @Patch('me/password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Cambiar mi contraseña',
    description:
      'Cambia la contraseña del usuario autenticado. Requiere verificación de la contraseña actual.',
  })
  @ApiOkResponse({ description: 'Contraseña cambiada exitosamente' })
  @ApiBadRequestResponse({
    description: 'Cuerpo de solicitud inválido o contraseña muy corta',
  })
  @ApiUnauthorizedResponse({
    description: 'La contraseña actual es incorrecta',
  })
  @ApiTooManyRequestsResponse({
    description:
      'Demasiados intentos de cambio de contraseña — máx. 5 por minuto',
  })
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangeMyPasswordDto,
  ) {
    return this.usersService.changeMyPassword(req.user.id, dto);
  }
}
