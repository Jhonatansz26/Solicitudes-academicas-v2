import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../notifications/email/email.service';
import { OFFICIAL_DOCUMENT_TYPE_LABELS } from '../../common/constants/labels';

@Injectable()
export class OfficialDocumentNotificationListener {
  private readonly logger = new Logger(
    OfficialDocumentNotificationListener.name,
  );

  constructor(private readonly emailService: EmailService) {}

  @OnEvent('officialDocument.generated')
  async handleDocumentGenerated(payload: {
    studentEmail: string;
    studentName: string;
    trackingNumber: string;
    type: string;
    version: number;
  }) {
    this.logger.log(
      `Enviando notificación de documento oficial a ${payload.studentEmail}`,
    );

    const documentTypeLabel =
      OFFICIAL_DOCUMENT_TYPE_LABELS[
        payload.type as keyof typeof OFFICIAL_DOCUMENT_TYPE_LABELS
      ] || payload.type;

    const subject = `Documento Oficial Generado - Solicitud ${payload.trackingNumber}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a2340; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Documento Oficial Generado</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="font-size: 16px;">Estimado/a <strong>${payload.studentName}</strong>,</p>
          <p>Su documento oficial ha sido generado exitosamente:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background-color: #fff; border: 1px solid #ddd;"><strong>Tipo:</strong></td>
              <td style="padding: 10px; background-color: #fff; border: 1px solid #ddd;">${documentTypeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #fff; border: 1px solid #ddd;"><strong>Versión:</strong></td>
              <td style="padding: 10px; background-color: #fff; border: 1px solid #ddd;">${payload.version}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #fff; border: 1px solid #ddd;"><strong>Solicitud:</strong></td>
              <td style="padding: 10px; background-color: #fff; border: 1px solid #ddd;">${payload.trackingNumber}</td>
            </tr>
          </table>
          <p>Puede descargar su documento desde el sistema de solicitudes académicas.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Este es un mensaje automático. Por favor no responda a este correo.
          </p>
        </div>
      </div>
    `;

    try {
      await this.emailService.send({
        to: payload.studentEmail,
        subject,
        html,
      });
      this.logger.log(`Notificación enviada a ${payload.studentEmail}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
