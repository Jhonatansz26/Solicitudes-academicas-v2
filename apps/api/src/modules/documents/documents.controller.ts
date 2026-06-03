import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  StreamableFile,
  Res,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiTooManyRequestsResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary: 'Subir documento adjunto',
    description:
      'Sube un archivo y lo adjunta a una solicitud. Tipos permitidos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX. Tamaño máximo: 10MB. Los estudiantes solo pueden subir a sus propias solicitudes en estado BORRADOR o DOCUMENTOS_PENDIENTES. Máximo 5 adjuntos por solicitud.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'requestId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo a subir (PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, máx. 10MB)',
        },
        requestId: {
          type: 'string',
          format: 'uuid',
          description: 'ID de la solicitud para adjuntar el archivo',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Documento subido exitosamente' })
  @ApiTooManyRequestsResponse({
    description: 'Límite de subidas excedido (5 por minuto)',
  })
  @ApiBadRequestResponse({
    description:
      'Tipo de archivo inválido, tamaño excede 10MB, o no se proporcionó archivo',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  @ApiForbiddenResponse({
    description:
      'No autorizado para subir a esta solicitud o solicitud no en estado permitido',
  })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  @ApiConflictResponse({
    description: 'Se alcanzó el máximo de 5 adjuntos por solicitud',
  })
  async upload(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.upload(
      file,
      body.requestId,
      req.user.id,
      role,
    );
  }

  @Get('request/:requestId')
  @ApiOperation({
    summary: 'Listar adjuntos de una solicitud',
    description:
      'Retorna todos los adjuntos de documentos para una solicitud específica, ordenados por fecha de creación (más reciente primero).',
  })
  @ApiOkResponse({ description: 'Lista de adjuntos' })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  @ApiForbiddenResponse({
    description:
      'El estudiante solo puede ver documentos de sus propias solicitudes',
  })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  async findByRequest(
    @Req() req: AuthenticatedRequest,
    @Param('requestId', ParseUUIDPipe) requestId: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.findByRequest(requestId, req.user.id, role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener metadatos del adjunto',
    description:
      'Retorna los metadatos de un adjunto específico incluyendo nombre del archivo, tipo MIME, tamaño e información del usuario que lo subió.',
  })
  @ApiOkResponse({ description: 'Metadatos del adjunto' })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  @ApiForbiddenResponse({ description: 'No autorizado para ver este adjunto' })
  @ApiNotFoundResponse({ description: 'Adjunto no encontrado' })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.findOne(id, req.user.id, role);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Descargar archivo adjunto',
    description:
      'Transmite el contenido del archivo para descarga. Retorna el archivo con su nombre original y tipo MIME.',
  })
  @ApiOkResponse({
    description: 'Flujo de archivo con encabezado Content-Disposition',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  @ApiForbiddenResponse({
    description: 'No autorizado para descargar este archivo',
  })
  @ApiNotFoundResponse({
    description: 'Adjunto o archivo no encontrado en almacenamiento',
  })
  async download(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    const { stream, mimeType, fileName } = await this.documentsService.download(
      id,
      req.user.id,
      role,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    return new StreamableFile(stream);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('STUDENT', 'STAFF', 'COORDINATOR', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar adjunto',
    description:
      'Elimina un adjunto de documento y su archivo del almacenamiento. Los usuarios solo pueden eliminar sus propias subidas. Los administradores pueden eliminar cualquier adjunto.',
  })
  @ApiOkResponse({ description: 'Adjunto eliminado exitosamente' })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  @ApiForbiddenResponse({
    description: 'No autorizado para eliminar este adjunto',
  })
  @ApiNotFoundResponse({ description: 'Adjunto no encontrado' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.remove(id, req.user.id, role);
  }
}
