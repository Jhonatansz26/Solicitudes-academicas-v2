import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { OfficialDocumentsService } from './official-documents.service';
import type { RequestStatus } from '@prisma/client';

interface RequestStatusChangedEvent {
  requestId: string;
  trackingNumber: string;
  title: string;
  newStatus: RequestStatus;
  previousStatus: RequestStatus;
  studentId: string;
  studentEmail: string;
  studentName: string;
  requestTypeName: string;
  actorId: string | null;
  comment: string | null;
}

const AUTO_GENERATED_NOTES = 'Generado automáticamente al aprobar la solicitud';

const DEFAULT_DOCUMENT_TYPES: Array<{
  type: 'CERTIFICATE' | 'CONSTANCY';
  condition?: (event: RequestStatusChangedEvent) => boolean;
}> = [{ type: 'CERTIFICATE' }];

@Injectable()
export class AutoDocumentGenerationListener {
  private readonly logger = new Logger(AutoDocumentGenerationListener.name);

  constructor(
    private readonly officialDocumentsService: OfficialDocumentsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('request.status.changed')
  async handleStatusChanged(event: RequestStatusChangedEvent) {
    if (event.newStatus !== 'APPROVED') {
      return;
    }

    this.logger.log(
      `[AutoDocumentGeneration] Request approved: ${event.requestId} (${event.trackingNumber})`,
    );

    try {
      const existingCount = await this.prisma.officialDocument.count({
        where: { requestId: event.requestId },
      });

      if (existingCount > 0) {
        this.logger.log(
          `[AutoDocumentGeneration] Document already exists for request ${event.requestId} (count: ${existingCount}). Skipping auto-generation.`,
        );
        return;
      }

      if (!event.actorId) {
        this.logger.warn(
          `[AutoDocumentGeneration] No actorId in event for request ${event.requestId}. Cannot generate document without an actor.`,
        );
        return;
      }

      for (const docConfig of DEFAULT_DOCUMENT_TYPES) {
        if (docConfig.condition && !docConfig.condition(event)) {
          continue;
        }

        this.logger.log(
          `[AutoDocumentGeneration] Generating document type=${docConfig.type} for request ${event.requestId}`,
        );

        await this.officialDocumentsService.generate(
          event.requestId,
          {
            type: docConfig.type,
            notes: AUTO_GENERATED_NOTES,
          },
          event.actorId,
          'COORDINATOR',
        );

        this.logger.log(
          `[AutoDocumentGeneration] Document generated successfully: type=${docConfig.type}, request=${event.requestId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[AutoDocumentGeneration] Failed to generate document for request ${event.requestId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
