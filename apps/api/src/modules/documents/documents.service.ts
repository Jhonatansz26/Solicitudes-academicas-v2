import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageProvider, StorageResult } from './storage/storage.interface';
import { LocalStorage } from './storage/local.storage';
import { RoleName } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_REQUEST = 5;

@Injectable()
export class DocumentsService {
  private storage: StorageProvider;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    localStorage: LocalStorage,
  ) {
    this.storage = localStorage;
  }

  async upload(
    file: Express.Multer.File,
    requestId: string,
    userId: string,
    role: RoleName,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.validateFile(file);

    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { userId: true, status: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (role === 'STUDENT' && request.userId !== userId) {
      throw new ForbiddenException('You can only upload documents to your own requests');
    }

    if (role === 'STUDENT') {
      const allowedStatuses = ['DRAFT', 'PENDING_DOCUMENTS'];
      if (!allowedStatuses.includes(request.status)) {
        throw new ForbiddenException(`Cannot upload to request in '${request.status}' state. Only DRAFT or PENDING_DOCUMENTS allowed`);
      }
    }

    const attachmentCount = await this.prisma.attachment.count({
      where: { requestId },
    });

    if (attachmentCount >= MAX_ATTACHMENTS_PER_REQUEST) {
      throw new ConflictException(`Maximum ${MAX_ATTACHMENTS_PER_REQUEST} attachments per request`);
    }

    const ext = MIME_TO_EXT[file.mimetype] || '';
    const uuid = randomUUID();
    const storageFileName = `${uuid}${ext}`;

    let storageResult: StorageResult;
    try {
      storageResult = await this.storage.upload(file.buffer, storageFileName, file.mimetype);
    } catch {
      throw new BadRequestException('Failed to store file');
    }

    try {
      const attachment = await this.prisma.$transaction(async (tx) => {
        const created = await tx.attachment.create({
          data: {
            requestId,
            fileName: storageResult.fileName,
            originalName: file.originalname,
            url: storageResult.url,
            mimeType: file.mimetype,
            fileSize: storageResult.fileSize,
            provider: 'local',
            uploadedBy: userId,
          },
          include: {
            uploader: { select: { id: true, fullName: true, email: true } },
          },
        });

        await tx.requestHistory.create({
          data: {
            requestId,
            previousStatus: request.status,
            newStatus: request.status,
            userId,
            comment: `Document uploaded: ${file.originalname}`,
          },
        });

        return created;
      });

      return attachment;
    } catch (error) {
      try {
        await this.storage.delete(storageFileName);
      } catch {
      }
      throw error;
    }
  }

  async findByRequest(requestId: string, userId: string, role: RoleName) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { userId: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (role === 'STUDENT' && request.userId !== userId) {
      throw new ForbiddenException('You can only view documents from your own requests');
    }

    return this.prisma.attachment.findMany({
      where: { requestId },
      include: {
        uploader: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: RoleName) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: {
        request: { select: { userId: true } },
        uploader: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (role === 'STUDENT' && attachment.request.userId !== userId) {
      throw new ForbiddenException('You can only view documents from your own requests');
    }

    return attachment;
  }

  async download(id: string, userId: string, role: RoleName): Promise<{ stream: Readable; mimeType: string; fileName: string }> {
    const attachment = await this.findOne(id, userId, role);

    if (!await this.storage.fileExists(attachment.fileName)) {
      throw new NotFoundException('File not found in storage');
    }

    const stream = await this.storage.getStream(attachment.fileName);
    return {
      stream,
      mimeType: attachment.mimeType,
      fileName: attachment.originalName,
    };
  }

  async remove(id: string, userId: string, role: RoleName) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
      include: { request: { select: { userId: true, status: true } } },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (role !== 'ADMIN' && attachment.uploadedBy !== userId) {
      throw new ForbiddenException('You can only delete your own uploads. Admin can delete any attachment');
    }

    const BLOCKED_DELETE_STATUSES: string[] = ['IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'];
    if (role !== 'ADMIN' && BLOCKED_DELETE_STATUSES.includes(attachment.request.status)) {
      throw new ForbiddenException(
        `Cannot delete documents from a request in '${attachment.request.status}' status`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.requestHistory.create({
        data: {
          requestId: attachment.requestId,
          previousStatus: attachment.request.status,
          newStatus: attachment.request.status,
          userId,
          comment: `Document deleted: ${attachment.originalName}`,
        },
      });

      await tx.attachment.delete({ where: { id } });
    });

    try {
      await this.storage.delete(attachment.fileName);
    } catch {
    }

    return { message: 'Attachment deleted', id };
  }

  private validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type '${file.mimetype}' not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size ${Math.round(file.size / 1024)}KB exceeds maximum ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
      );
    }
  }
}
