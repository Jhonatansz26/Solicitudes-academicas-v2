import PDFDocument from 'pdfkit';
import { ConstancyData } from '../pdf.types';

export function buildConstancyPdf(data: ConstancyData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'letter',
      margin: 0,
      info: {
        Title: `Constancia - ${data.studentName}`,
        Author: 'Sistema de Solicitudes Académicas',
        Subject: data.trackingNumber,
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 72;
    const contentWidth = pageWidth - margin * 2;

    // Header bar
    doc.rect(0, 0, pageWidth, 100).fill('#1a2340');

    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22);
    doc.text(data.institutionName, margin, 25, {
      width: contentWidth,
      align: 'center',
    });

    doc.font('Helvetica').fontSize(12).fillColor('#E8A820');
    doc.text('Dirección de Registro Académico', margin, 55, {
      width: contentWidth,
      align: 'center',
    });

    // Separator
    doc
      .moveTo(margin, 120)
      .lineTo(pageWidth - margin, 120)
      .stroke('#1a2340');

    // Title
    doc.fillColor('#1a2340').font('Helvetica-Bold').fontSize(20);
    doc.text(data.documentTitle, margin, 145, {
      width: contentWidth,
      align: 'center',
    });

    doc
      .moveTo(margin, 180)
      .lineTo(pageWidth - margin, 180)
      .stroke('#1a2340');

    // Body
    let y = 210;
    doc.fillColor('#333333').font('Helvetica').fontSize(12);
    doc.text(
      'La Dirección de Registro Académico HACE CONSTAR QUE:',
      margin,
      y,
      { width: contentWidth },
    );

    y += 40;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#555555');
    doc.text('Nombre:', margin, y, { width: 100 });
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#1a2340')
      .text(data.studentName, margin + 100, y, { width: contentWidth - 100 });

    y += 22;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#555555');
    doc.text('Documento:', margin, y, { width: 100 });
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#1a2340')
      .text(data.documentNumber, margin + 100, y, {
        width: contentWidth - 100,
      });

    y += 22;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#555555');
    doc.text('Código:', margin, y, { width: 100 });
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#1a2340')
      .text(data.studentCode, margin + 100, y, {
        width: contentWidth - 100,
      });

    y += 22;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#555555');
    doc.text('Programa:', margin, y, { width: 100 });
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#1a2340')
      .text(data.program, margin + 100, y, { width: contentWidth - 100 });

    y += 22;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#555555');
    doc.text('Semestre:', margin, y, { width: 100 });
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#1a2340')
      .text(`${data.semester}`, margin + 100, y, {
        width: contentWidth - 100,
      });

    y += 30;
    doc.fillColor('#333333').font('Helvetica').fontSize(12);
    doc.text(
      `La presente constancia se expide a solicitud del interesado para los fines que estime convenientes: ${data.purpose}`,
      margin,
      y,
      { width: contentWidth },
    );

    y += 40;
    doc.fillColor('#666666').font('Helvetica').fontSize(10);
    doc.text(`Solicitud: ${data.trackingNumber}`, margin, y, {
      width: contentWidth,
    });

    y += 16;
    doc.text(`Fecha de emisión: ${data.issuedAt}`, margin, y, {
      width: contentWidth,
    });

    // Signature
    y += 60;
    doc
      .moveTo(margin, y)
      .lineTo(margin + 180, y)
      .stroke('#333333');
    doc
      .moveTo(pageWidth - margin - 180, y)
      .lineTo(pageWidth - margin, y)
      .stroke('#333333');

    y += 8;
    doc.fillColor('#333333').font('Helvetica').fontSize(10);
    doc.text('Firma', margin, y, { width: 180, align: 'center' });
    doc.text('Sello', pageWidth - margin - 180, y, {
      width: 180,
      align: 'center',
    });

    // Footer
    doc.rect(0, pageHeight - 50, pageWidth, 50).fill('#f4f6f9');
    doc.fillColor('#999999').font('Helvetica').fontSize(9);
    doc.text(
      'Documento generado automáticamente por el Sistema de Solicitudes Académicas.',
      margin,
      pageHeight - 42,
      { width: contentWidth, align: 'center' },
    );
    doc.text(
      `Tracking: ${data.trackingNumber} | Versión ${data.version}`,
      margin,
      pageHeight - 28,
      { width: contentWidth, align: 'center' },
    );

    doc.end();
  });
}
