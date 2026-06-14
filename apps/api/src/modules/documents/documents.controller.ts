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
  @UseGuards(RolesGuard)
  @Roles('STUDENT', 'ADMIN')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary: 'Subir documento adjunto',
    description:
      'Sube un archivo y lo adjunta a una solicitud. Tipos permitidos: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX. Tamaño máximo: 10MB. Solo STUDENT y ADMIN pueden subir. STUDENT solo a sus propias solicitudes en estado DRAFT o PENDING_DOCUMENTS. ADMIN puede subir a cualquier solicitud en estado no final. STAFF y COORDINATOR no pueden subir. Máximo 5 adjuntos por solicitud.',
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
      'Solo STUDENT y ADMIN pueden subir. STAFF y COORDINATOR bloqueados.',
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
    const role = req.user.role as 'STUDENT' | 'ADMIN';
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
  @Roles('STUDENT', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar adjunto',
    description:
      'Elimina un adjunto de documento y su archivo del almacenamiento. Solo STUDENT (sobre propias subidas) y ADMIN pueden eliminar. STAFF y COORDINATOR no pueden eliminar documentos. Bloqueado en estados finales.',
  })
  @ApiOkResponse({ description: 'Adjunto eliminado exitosamente' })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso ausente o inválido',
  })
  @ApiForbiddenResponse({
    description:
      'Solo STUDENT y ADMIN pueden eliminar. STAFF y COORDINATOR bloqueados.',
  })
  @ApiNotFoundResponse({ description: 'Adjunto no encontrado' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'ADMIN';
    return this.documentsService.remove(id, req.user.id, role);
  }
}
