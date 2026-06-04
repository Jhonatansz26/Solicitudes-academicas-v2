/**
 * Utilidad de generación de códigos QR.
 * Reservado para Sprint 2A.5 — Verificación de documentos mediante QR.
 * No eliminar: pendiente de integración en templates PDF.
 */
import QRCode from 'qrcode';

export async function generateQrBuffer(data: string): Promise<Buffer> {
  const pngBuffer = await QRCode.toBuffer(data, {
    type: 'png',
    width: 120,
    margin: 1,
    color: {
      dark: '#1a2340',
      light: '#ffffff',
    },
  });

  return pngBuffer;
}
