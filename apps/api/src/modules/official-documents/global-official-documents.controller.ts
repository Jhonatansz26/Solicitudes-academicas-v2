import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
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
import { QueryGlobalDocumentsDto } from './dto/query-global-documents.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; role: string };
}

@ApiTags('Documentos Oficiales - Global')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('official-documents')
export class GlobalOfficialDocumentsController {
  constructor(
    private readonly officialDocumentsService: OfficialDocumentsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos los documentos oficiales',
    description:
      'Retorna una lista paginada de documentos oficiales. Los estudiantes solo ven documentos de sus propias solicitudes. Funcionarios, coordinadores y administradores ven todos los documentos.',
  })
  @ApiResponse({ status: 200, description: 'Lista de documentos oficiales' })
  @ApiResponse({
    status: 401,
    description: 'Token de acceso ausente o inválido',
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryGlobalDocumentsDto,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.officialDocumentsService.findAllGlobal(
      req.user.id,
      role,
      query.page!,
      query.limit!,
      query.type,
      query.search,
    );
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar documento oficial por ID' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async download(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    const { stream, mimeType, fileName } =
      await this.officialDocumentsService.download(id, req.user.id, role);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    return new StreamableFile(stream);
  }
}
