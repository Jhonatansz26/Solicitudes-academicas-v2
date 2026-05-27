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
  @ApiOperation({
    summary: 'Upload a document attachment',
    description: 'Uploads a file and attaches it to a request. Allowed types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX. Max size: 10MB. Students can only upload to their own requests in DRAFT or PENDING_DOCUMENTS status. Max 5 attachments per request.',
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
          description: 'File to upload (PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, max 10MB)',
        },
        requestId: {
          type: 'string',
          format: 'uuid',
          description: 'ID of the request to attach the file to',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Document uploaded successfully' })
  @ApiBadRequestResponse({ description: 'Invalid file type, file size exceeds 10MB, or no file provided' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Not authorized to upload to this request or request not in allowed status' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  @ApiConflictResponse({ description: 'Maximum 5 attachments per request reached' })
  async upload(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.upload(file, body.requestId, req.user.id, role);
  }

  @Get('request/:requestId')
  @ApiOperation({
    summary: 'List attachments for a request',
    description: 'Returns all document attachments for a specific request, ordered by creation date (newest first).',
  })
  @ApiOkResponse({ description: 'List of attachments' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Student can only view documents from their own requests' })
  @ApiNotFoundResponse({ description: 'Request not found' })
  async findByRequest(
    @Req() req: AuthenticatedRequest,
    @Param('requestId', ParseUUIDPipe) requestId: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.findByRequest(requestId, req.user.id, role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get attachment metadata',
    description: 'Returns metadata for a specific document attachment including file name, MIME type, size, and uploader info.',
  })
  @ApiOkResponse({ description: 'Attachment metadata' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Not authorized to view this attachment' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.findOne(id, req.user.id, role);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download an attachment file',
    description: 'Streams the actual file content for download. Returns the file with its original name and MIME type.',
  })
  @ApiOkResponse({ description: 'File stream with Content-Disposition header' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Not authorized to download this file' })
  @ApiNotFoundResponse({ description: 'Attachment or file not found in storage' })
  async download(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
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
  @ApiOperation({
    summary: 'Delete an attachment',
    description: 'Deletes a document attachment and its file from storage. Users can only delete their own uploads. Admins can delete any attachment.',
  })
  @ApiOkResponse({ description: 'Attachment deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Not authorized to delete this attachment' })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const role = req.user.role as 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';
    return this.documentsService.remove(id, req.user.id, role);
  }
}
