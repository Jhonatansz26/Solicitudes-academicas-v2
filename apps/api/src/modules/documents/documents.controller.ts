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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document attachment to a request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'requestId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, max 10MB)',
        },
        requestId: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the request to attach the file to',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type, size, or missing fields' })
  @ApiResponse({ status: 403, description: 'Not authorized to upload to this request' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 409, description: 'Maximum attachments per request reached' })
  async upload(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.upload(file, body.requestId, req.user.id, role);
  }

  @Get('request/:requestId')
  @ApiOperation({ summary: 'List all attachments for a request' })
  @ApiResponse({ status: 200, description: 'List of attachments' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this request documents' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async findByRequest(
    @Req() req: AuthenticatedRequest,
    @Param('requestId') requestId: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.findByRequest(requestId, req.user.id, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attachment metadata' })
  @ApiResponse({ status: 200, description: 'Attachment metadata' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this attachment' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.findOne(id, req.user.id, role);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download an attachment file' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 403, description: 'Not authorized to download this file' })
  @ApiResponse({ status: 404, description: 'Attachment or file not found' })
  async download(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    const { stream, mimeType, fileName } = await this.documentsService.download(id, req.user.id, role);

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
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this attachment' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.remove(id, req.user.id, role);
  }
}
