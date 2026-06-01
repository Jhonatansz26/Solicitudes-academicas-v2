import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications.service';
import { requestSubmittedTemplate } from '../email/templates/request-submitted.template';
import { requestApprovedTemplate } from '../email/templates/request-approved.template';
import { requestRejectedTemplate } from '../email/templates/request-rejected.template';
import { pendingDocumentsTemplate } from '../email/templates/pending-documents.template';
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

@Injectable()
export class RequestStatusChangedListener {
  private readonly logger = new Logger(RequestStatusChangedListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('request.status.changed')
  async handleStatusChanged(event: RequestStatusChangedEvent) {
    try {
      switch (event.newStatus) {
        case 'SUBMITTED':
          await this.notifyStaff(event);
          break;
        case 'APPROVED':
          await this.notifyStudent(event, 'approved');
          break;
        case 'REJECTED':
          await this.notifyStudent(event, 'rejected');
          break;
        case 'PENDING_DOCUMENTS':
          await this.notifyStudent(event, 'pending_documents');
          break;
        default:
          break;
      }
    } catch (err) {
      this.logger.error(
        `Failed to process status change notification for request ${event.requestId}: ${err}`,
      );
    }
  }

  private async notifyStaff(event: RequestStatusChangedEvent) {
    try {
      const staffUsers = await this.prisma.user.findMany({
        where: {
          role: { name: 'STAFF' },
          isActive: true,
        },
        select: { id: true, email: true },
      });

      if (staffUsers.length === 0) {
        this.logger.warn('No active staff users to notify');
        return;
      }

      const template = requestSubmittedTemplate({
        studentName: event.studentName,
        trackingNumber: event.trackingNumber,
        requestType: event.requestTypeName,
      });

      const results = await Promise.allSettled(
        staffUsers.map(async (staff) => {
          try {
            await this.emailService.send({
              to: staff.email,
              subject: template.subject,
              html: template.html,
            });
            await this.notificationsService.createEmailRecord({
              userId: staff.id,
              requestId: event.requestId,
              subject: template.subject,
              sent: true,
            });
          } catch {
            await this.notificationsService.createEmailRecord({
              userId: staff.id,
              requestId: event.requestId,
              subject: template.subject,
              sent: false,
            });
          }
        }),
      );

      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        this.logger.warn(
          `Failed to send ${failed}/${staffUsers.length} staff notifications for request ${event.trackingNumber}`,
        );
      }
    } catch (err) {
      this.logger.error(`Failed to notify staff for request ${event.requestId}: ${err}`);
    }
  }

  private async notifyStudent(
    event: RequestStatusChangedEvent,
    type: 'approved' | 'rejected' | 'pending_documents',
  ) {
    try {
      let template: { subject: string; html: string };

      switch (type) {
        case 'approved':
          template = requestApprovedTemplate({
            studentName: event.studentName,
            trackingNumber: event.trackingNumber,
            requestType: event.requestTypeName,
          });
          break;
        case 'rejected':
          template = requestRejectedTemplate({
            studentName: event.studentName,
            trackingNumber: event.trackingNumber,
            requestType: event.requestTypeName,
            reason: event.comment ?? 'No se proporcionó un motivo específico.',
          });
          break;
        case 'pending_documents':
          template = pendingDocumentsTemplate({
            studentName: event.studentName,
            trackingNumber: event.trackingNumber,
            requestType: event.requestTypeName,
            comment: event.comment,
          });
          break;
      }

      await this.emailService.send({
        to: event.studentEmail,
        subject: template.subject,
        html: template.html,
      });

      await this.notificationsService.createEmailRecord({
        userId: event.studentId,
        requestId: event.requestId,
        subject: template.subject,
        sent: true,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send ${type} notification to ${event.studentEmail}: ${err}`,
      );

      try {
        await this.notificationsService.createEmailRecord({
          userId: event.studentId,
          requestId: event.requestId,
          subject: `Solicitud ${event.trackingNumber} — ${type}`,
          sent: false,
        });
      } catch {
        // silent
      }
    }
  }
}
