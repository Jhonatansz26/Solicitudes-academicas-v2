import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createEmailRecord(data: {
    userId: string;
    requestId?: string;
    subject: string;
    sent: boolean;
  }) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: data.userId,
          requestId: data.requestId ?? null,
          channel: 'EMAIL',
          subject: data.subject,
          sent: data.sent,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to create notification record: ${err}`);
    }
  }
}
