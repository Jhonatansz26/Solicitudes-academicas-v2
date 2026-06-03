import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { CreateRequestTypeDto } from './dto/create-request-type.dto';
import { UpdateRequestTypeDto } from './dto/update-request-type.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { RequestStatus, RoleName } from '@prisma/client';
import { randomBytes } from 'crypto';

const FINAL_STATUSES: RequestStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED'];

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateRequestDto) {
    const requestType = await this.prisma.requestType.findUnique({
      where: { id: dto.requestTypeId },
    });

    if (!requestType || !requestType.isActive) {
      throw new NotFoundException('Tipo de solicitud no encontrado o inactivo');
    }

    const trackingNumber = this.generateTrackingNumber();

    const request = await this.prisma.request.create({
      data: {
        trackingNumber,
        title: dto.title,
        description: dto.description,
        status: 'DRAFT',
        userId,
        requestTypeId: dto.requestTypeId,
      },
      include: {
        requestType: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return request;
  }

  async findAll(userId: string, role: RoleName, query: QueryRequestsDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role === 'STUDENT') {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.requestTypeId) {
      where.requestTypeId = query.requestTypeId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requestType: { select: { id: true, name: true } },
          user: { select: { id: true, fullName: true, email: true } },
          _count: { select: { attachments: true, history: true } },
        },
      }),
      this.prisma.request.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string, role: RoleName) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        requestType: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            documentNumber: true,
          },
        },
        attachments: { orderBy: { createdAt: 'desc' } },
        history: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (role === 'STUDENT' && request.userId !== userId) {
      throw new ForbiddenException('Solo puedes ver tus propias solicitudes');
    }

    return request;
  }

  async update(id: string, userId: string, dto: UpdateRequestDto) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException(
        'Solo puedes editar tus propias solicitudes',
      );
    }

    if (request.status !== 'DRAFT') {
      throw new ForbiddenException(
        'Solo se pueden editar las solicitudes en estado borrador',
      );
    }

    return this.prisma.request.update({
      where: { id },
      data: { ...dto },
      include: {
        requestType: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async submit(id: string, userId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException(
        'Solo puedes enviar tus propias solicitudes',
      );
    }

    if (request.status !== 'DRAFT') {
      throw new ConflictException(
        'Solo se pueden enviar las solicitudes en estado borrador',
      );
    }

    return this.changeStatusInternal(
      id,
      'SUBMITTED',
      request.status,
      userId,
      null,
    );
  }

  async cancel(id: string, userId: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException(
        'Solo puedes cancelar tus propias solicitudes',
      );
    }

    if (FINAL_STATUSES.includes(request.status)) {
      throw new ForbiddenException(
        'No se puede cancelar una solicitud en estado final',
      );
    }

    return this.changeStatusInternal(
      id,
      'CANCELLED',
      request.status,
      userId,
      'Cancelled by user',
    );
  }

  async changeStatus(
    id: string,
    dto: ChangeStatusDto,
    actorId: string,
    actorRole: RoleName,
  ) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (FINAL_STATUSES.includes(request.status)) {
      throw new ForbiddenException(
        `La solicitud ya se encuentra en estado final '${request.status}'`,
      );
    }

    if (request.status === dto.newStatus) {
      throw new ConflictException(
        `La solicitud ya se encuentra en estado '${dto.newStatus}'`,
      );
    }

    if (dto.newStatus === 'REJECTED' && !dto.comment) {
      throw new BadRequestException(
        'Se requiere un motivo al rechazar una solicitud',
      );
    }

    if (
      actorRole === 'STAFF' &&
      dto.newStatus !== 'IN_REVIEW' &&
      dto.newStatus !== 'PENDING_DOCUMENTS'
    ) {
      throw new ForbiddenException(
        "El funcionario solo puede cambiar a 'En revisión' o 'Documentos pendientes'",
      );
    }

    if (
      actorRole === 'COORDINATOR' &&
      dto.newStatus !== 'APPROVED' &&
      dto.newStatus !== 'REJECTED'
    ) {
      throw new ForbiddenException(
        'El coordinador solo puede aprobar o rechazar',
      );
    }

    return this.changeStatusInternal(
      id,
      dto.newStatus,
      request.status,
      actorId,
      dto.comment ?? null,
    );
  }

  async getRequestTypes() {
    return this.prisma.requestType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAllRequestTypes() {
    return this.prisma.requestType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createRequestType(dto: CreateRequestTypeDto) {
    return this.prisma.requestType.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        estimatedDays: dto.estimatedDays,
      },
    });
  }

  async updateRequestType(id: string, dto: UpdateRequestTypeDto) {
    const type = await this.prisma.requestType.findUnique({ where: { id } });
    if (!type) {
      throw new NotFoundException('Request type not found');
    }

    return this.prisma.requestType.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        estimatedDays: dto.estimatedDays,
      },
    });
  }

  async deleteRequestType(id: string) {
    const type = await this.prisma.requestType.findUnique({ where: { id } });
    if (!type) {
      throw new NotFoundException('Request type not found');
    }

    return this.prisma.requestType.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(userId: string, role: RoleName) {
    const where = role === 'STUDENT' ? { userId } : {};

    const [byStatus, recentActivity] = await Promise.all([
      this.prisma.request.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.request.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          trackingNumber: true,
          title: true,
          status: true,
          updatedAt: true,
          user: { select: { fullName: true } },
          requestType: { select: { name: true } },
        },
      }),
    ]);

    const counts: Record<string, number> = {};
    for (const entry of byStatus) {
      counts[entry.status] = entry._count.status;
    }

    return {
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      draft: counts['DRAFT'] || 0,
      submitted: counts['SUBMITTED'] || 0,
      inReview: (counts['IN_REVIEW'] || 0) + (counts['PENDING_DOCUMENTS'] || 0),
      approved: counts['APPROVED'] || 0,
      rejected: counts['REJECTED'] || 0,
      cancelled: counts['CANCELLED'] || 0,
      recentActivity,
    };
  }

  private async changeStatusInternal(
    id: string,
    newStatus: RequestStatus,
    expectedStatus: RequestStatus,
    userId: string | null,
    comment: string | null,
  ) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.request.updateMany({
        where: { id, status: expectedStatus },
        data: { status: newStatus },
      });

      if (result.count === 0) {
        throw new ConflictException(
          'El estado de la solicitud fue modificado por otro proceso',
        );
      }

      const request = await tx.request.findUnique({
        where: { id },
        include: {
          requestType: true,
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (!request) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      await tx.requestHistory.create({
        data: {
          requestId: id,
          previousStatus: expectedStatus,
          newStatus,
          userId,
          comment,
        },
      });

      return request;
    });

    this.emitStatusChanged(updated, expectedStatus, userId, comment);
    return updated;
  }

  private emitStatusChanged(
    request: {
      id: string;
      trackingNumber: string;
      title: string;
      status: RequestStatus;
      requestType: { name: string };
      user: { id: string; email: string; fullName: string };
    },
    previousStatus: RequestStatus,
    actorId: string | null,
    comment: string | null,
  ) {
    try {
      this.eventEmitter.emit('request.status.changed', {
        requestId: request.id,
        trackingNumber: request.trackingNumber,
        title: request.title,
        newStatus: request.status,
        previousStatus,
        studentId: request.user.id,
        studentEmail: request.user.email,
        studentName: request.user.fullName,
        requestTypeName: request.requestType.name,
        actorId,
        comment,
      });
    } catch {
      // best-effort: event emission failure must not break request flow
    }
  }

  private generateTrackingNumber(): string {
    const prefix = 'SA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
