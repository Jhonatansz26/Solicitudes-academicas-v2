import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications.service';
import { welcomeTemplate } from '../email/templates/welcome.template';

interface UserCreatedEvent {
  userId: string;
  email: string;
  fullName: string;
  roleName: string;
}

@Injectable()
export class UserCreatedListener {
  private readonly logger = new Logger(UserCreatedListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent) {
    try {
      const template = welcomeTemplate({
        fullName: event.fullName,
        role: event.roleName,
      });

      await this.emailService.send({
        to: event.email,
        subject: template.subject,
        html: template.html,
      });

      await this.notificationsService.createEmailRecord({
        userId: event.userId,
        subject: template.subject,
        sent: true,
      });
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${event.email}: ${err}`);

      try {
        await this.notificationsService.createEmailRecord({
          userId: event.userId,
          subject: 'Bienvenido al Sistema de Solicitudes Académicas',
          sent: false,
        });
      } catch {
        // silent
      }
    }
  }
}
