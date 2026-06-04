import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { OfficialDocumentsService } from './official-documents.service';
import { GenerateDocumentDto } from './dto/generate-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Documentos Oficiales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('requests/:requestId/official-documents')
export class OfficialDocumentsController {
  constructor(
    private readonly officialDocumentsService: OfficialDocumentsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('STAFF', 'COORDINATOR', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generar documento oficial' })
  @ApiResponse({ status: 201, description: 'Documento generado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Solicitud no aprobada o datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo funcionarios pueden generar documentos',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async generate(
    @Req() req: AuthenticatedRequest,
    @Param('requestId') requestId: string,
    @Body() dto: GenerateDocumentDto,
  ) {
    const role = req.user.role as 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.officialDocumentsService.generate(
      requestId,
      dto,
      req.user.id,
      role,
    );
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obtener última versión del documento oficial' })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontraron documentos' })
  async getLatest(
    @Req() req: AuthenticatedRequest,
    @Param('requestId') requestId: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.officialDocumentsService.getLatest(
      requestId,
      req.user.id,
      role,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las versiones de documentos oficiales',
  })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Param('requestId') requestId: string,
    @Query() query: QueryDocumentsDto,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.officialDocumentsService.getAllVersions(
      requestId,
      req.user.id,
      role,
      query.page!,
      query.limit!,
    );
  }

  @Get(':documentId/download')
  @ApiOperation({ summary: 'Descargar documento oficial' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async download(
    @Req() req: AuthenticatedRequest,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    const { stream, mimeType, fileName } =
      await this.officialDocumentsService.download(
        documentId,
        req.user.id,
        role,
      );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    return new StreamableFile(stream);
  }
}
