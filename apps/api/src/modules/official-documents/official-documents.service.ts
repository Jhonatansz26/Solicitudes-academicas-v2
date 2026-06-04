import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  StorageProvider,
  StorageResult,
} from '../documents/storage/storage.interface';
import { STORAGE_PROVIDER } from '../documents/documents.module';
import { PdfService } from './pdf.service';
import { GenerateDocumentDto } from './dto/generate-document.dto';

import { RoleName, Prisma } from '@prisma/client';

@Injectable()
export class OfficialDocumentsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
    private eventEmitter: EventEmitter2,
  ) {}

  async generate(
    requestId: string,
    dto: GenerateDocumentDto,
    userId: string,
    role: RoleName,
  ) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: { studentProfile: true },
        },
        requestType: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== 'APPROVED') {
      throw new BadRequestException(
        `Solo se pueden generar documentos para solicitudes aprobadas. Estado actual: ${request.status}`,
      );
    }

    if (!request.user.studentProfile) {
      throw new BadRequestException(
        'El estudiante no tiene perfil académico registrado',
      );
    }

    const snapshotData = {
      institutionName: 'INSTITUCIÓN EDUCATIVA',
      documentTitle: dto.type === 'CERTIFICATE' ? 'CERTIFICADO' : 'CONSTANCIA',
      studentName: request.user.fullName,
      documentNumber: request.user.documentNumber,
      studentCode: request.user.studentProfile.studentCode,
      program: request.user.studentProfile.program,
      semester: request.user.studentProfile.semester,
      purpose:
        dto.type === 'CONSTANCY'
          ? 'Para los fines que el interesado estime convenientes'
          : undefined,
      trackingNumber: request.trackingNumber,
      issuedAt: new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    const buffer = await this.pdfService.generate(dto.type, snapshotData);

    if (buffer.length === 0) {
      throw new BadRequestException('Error al generar el documento PDF');
    }

    const latest = await this.prisma.officialDocument.findFirst({
      where: { requestId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;

    const fileName = `official-documents-${requestId}-v${version}-${dto.type}-${Date.now()}.pdf`;

    let storageResult: StorageResult;
    try {
      storageResult = await this.storage.upload(
        buffer,
        fileName,
        'application/pdf',
      );
    } catch {
      throw new BadRequestException('Error al almacenar el documento');
    }

    const document = await this.prisma.$transaction(async (tx) => {
      const created = await tx.officialDocument.create({
        data: {
          requestId,
          version,
          type: dto.type,
          snapshotData: snapshotData,
          fileName: storageResult.fileName,
          filePath: storageResult.url,
          fileSize: storageResult.fileSize,
          provider: 'local',
          generatedBy: userId,
          notes: dto.notes ?? null,
        },
        include: {
          generator: { select: { id: true, fullName: true, email: true } },
          request: {
            select: {
              id: true,
              trackingNumber: true,
              title: true,
            },
          },
        },
      });

      await tx.requestHistory.create({
        data: {
          requestId,
          previousStatus: 'APPROVED',
          newStatus: 'APPROVED',
          userId,
          comment: `Documento oficial generado: ${dto.type} v${version}`,
        },
      });

      return created;
    });

    this.eventEmitter.emit('officialDocument.generated', {
      requestId: document.requestId,
      documentId: document.id,
      type: dto.type,
      version: document.version,
      studentEmail: request.user.email,
      studentName: request.user.fullName,
      trackingNumber: request.trackingNumber,
    });

    return document;
  }

  async getLatest(requestId: string, requesterId: string, role: RoleName) {
    await this.verifyAccess(requestId, requesterId, role);

    const document = await this.prisma.officialDocument.findFirst({
      where: { requestId },
      orderBy: { version: 'desc' },
      include: {
        generator: { select: { id: true, fullName: true, email: true } },
        request: {
          select: { id: true, trackingNumber: true, title: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(
        'No se encontraron documentos oficiales para esta solicitud',
      );
    }

    return document;
  }

  async getAllVersions(
    requestId: string,
    requesterId: string,
    role: RoleName,
    page: number,
    limit: number,
  ) {
    await this.verifyAccess(requestId, requesterId, role);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.officialDocument.findMany({
        where: { requestId },
        orderBy: { version: 'desc' },
        skip,
        take: limit,
        include: {
          generator: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.officialDocument.count({ where: { requestId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async download(documentId: string, requesterId: string, role: RoleName) {
    const document = await this.prisma.officialDocument.findUnique({
      where: { id: documentId },
      include: { request: { select: { userId: true } } },
    });

    if (!document) {
      throw new NotFoundException('Documento oficial no encontrado');
    }

    if (role === 'STUDENT' && document.request.userId !== requesterId) {
      throw new ForbiddenException(
        'Solo puedes descargar documentos de tus propias solicitudes',
      );
    }

    if (!(await this.storage.fileExists(document.fileName))) {
      throw new NotFoundException('Archivo no encontrado en almacenamiento');
    }

    const stream = await this.storage.getStream(document.fileName);

    return {
      stream,
      mimeType: 'application/pdf',
      fileName: document.fileName,
    };
  }

  private async verifyAccess(
    requestId: string,
    requesterId: string,
    role: RoleName,
  ) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      select: { userId: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (role === 'STUDENT' && request.userId !== requesterId) {
      throw new ForbiddenException(
        'Solo puedes ver documentos de tus propias solicitudes',
      );
    }
  }
}
