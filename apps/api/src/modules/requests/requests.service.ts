import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { RequestStatus, RoleName } from '@prisma/client';
import { randomBytes } from 'crypto';

const FINAL_STATUSES: RequestStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED'];

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRequestDto) {
    const requestType = await this.prisma.requestType.findUnique({
      where: { id: dto.requestTypeId },
    });

    if (!requestType || !requestType.isActive) {
      throw new NotFoundException('Request type not found or inactive');
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
    const limit = query.limit ?? 20;
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
        user: { select: { id: true, fullName: true, email: true, documentNumber: true } },
        attachments: { orderBy: { createdAt: 'desc' } },
        history: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (role === 'STUDENT' && request.userId !== userId) {
      throw new ForbiddenException('You can only view your own requests');
    }

    return request;
  }

  async update(id: string, userId: string, dto: UpdateRequestDto) {
    const request = await this.prisma.request.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only edit your own requests');
    }

    if (request.status !== 'DRAFT') {
      throw new ForbiddenException('Only draft requests can be edited');
    }

    return this.prisma.request.update({
      where: { id },
      data: { ...dto },
      include: { requestType: true, user: { select: { id: true, fullName: true, email: true } } },
    });
  }

  async submit(id: string, userId: string) {
    const request = await this.prisma.request.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only submit your own requests');
    }

    if (request.status !== 'DRAFT') {
      throw new ConflictException('Only draft requests can be submitted');
    }

    return this.changeStatusInternal(id, 'SUBMITTED', userId, null);
  }

  async cancel(id: string, userId: string) {
    const request = await this.prisma.request.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (FINAL_STATUSES.includes(request.status)) {
      throw new ForbiddenException('Cannot cancel a request in a final state');
    }

    return this.changeStatusInternal(id, 'CANCELLED', userId, 'Cancelled by user');
  }

  async changeStatus(id: string, dto: ChangeStatusDto, actorId: string, actorRole: RoleName) {
    const request = await this.prisma.request.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (FINAL_STATUSES.includes(request.status)) {
      throw new ForbiddenException(`Request is already in final state '${request.status}'`);
    }

    if (request.status === dto.newStatus) {
      throw new ConflictException(`Request is already in state '${dto.newStatus}'`);
    }

    if (dto.newStatus === 'REJECTED' && !dto.comment) {
      throw new BadRequestException('Comment is required when rejecting a request');
    }

    if (actorRole === 'STAFF' && dto.newStatus !== 'IN_REVIEW' && dto.newStatus !== 'PENDING_DOCUMENTS') {
      throw new ForbiddenException('Staff can only move to IN_REVIEW or PENDING_DOCUMENTS');
    }

    if (actorRole === 'COORDINATOR' && dto.newStatus !== 'APPROVED' && dto.newStatus !== 'REJECTED') {
      throw new ForbiddenException('Coordinator can only approve or reject');
    }

    return this.changeStatusInternal(id, dto.newStatus, actorId, dto.comment ?? null);
  }

  async getRequestTypes() {
    return this.prisma.requestType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  private async changeStatusInternal(
    id: string,
    newStatus: RequestStatus,
    userId: string | null,
    comment: string | null,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({ where: { id } });

      if (!request) {
        throw new NotFoundException('Request not found');
      }

      const updated = await tx.request.update({
        where: { id },
        data: { status: newStatus },
        include: {
          requestType: true,
          user: { select: { id: true, fullName: true, email: true } },
        },
      });

      await tx.requestHistory.create({
        data: {
          requestId: id,
          previousStatus: request.status,
          newStatus,
          userId,
          comment,
        },
      });

      return updated;
    });
  }

  private generateTrackingNumber(): string {
    const prefix = 'SA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
