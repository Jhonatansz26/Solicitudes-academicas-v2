import { Injectable, BadRequestException } from '@nestjs/common';
import { buildCertificatePdf } from './templates/certificate.template';
import { buildConstancyPdf } from './templates/constancy.template';
import { CertificateData, ConstancyData } from './pdf.types';

export type OfficialDocumentType =
  | 'CERTIFICATE'
  | 'CONSTANCY'
  | 'RESOLUTION'
  | 'TRANSCRIPT'
  | 'OTHER';

@Injectable()
export class PdfService {
  async generate(
    type: OfficialDocumentType,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    switch (type) {
      case 'CERTIFICATE':
        return buildCertificatePdf(data as unknown as CertificateData);
      case 'CONSTANCY':
        return buildConstancyPdf(data as unknown as ConstancyData);
      default:
        throw new BadRequestException(
          `Tipo de documento no soportado: ${type}`,
        );
    }
  }
}
