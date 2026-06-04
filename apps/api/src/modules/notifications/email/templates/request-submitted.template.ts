export interface RequestSubmittedData {
  studentName: string;
  trackingNumber: string;
  requestType: string;
}

export function requestSubmittedTemplate(data: RequestSubmittedData) {
  return {
    subject: `Nueva solicitud ${data.trackingNumber} pendiente de revisión`,
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #1a2340; padding: 24px; text-align: center;">
      <h1 style="color: #E8A820; margin: 0; font-size: 20px;">Solicitudes Académicas</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1a2340; margin: 0 0 16px;">Nueva solicitud recibida</h2>
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 12px;">
        <strong>${data.studentName}</strong> ha enviado una nueva solicitud.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #718096; font-size: 14px;">Tracking</td><td style="padding: 8px 0; font-weight: 600; color: #1a2340;">${data.trackingNumber}</td></tr>
        <tr><td style="padding: 8px 0; color: #718096; font-size: 14px;">Tipo</td><td style="padding: 8px 0; font-weight: 600; color: #1a2340;">${data.requestType}</td></tr>
      </table>
      <p style="color: #4a5568; line-height: 1.6; margin: 0;">
        Ingresa al portal para revisar y gestionar esta solicitud.
      </p>
    </div>
    <div style="background: #f4f6f9; padding: 16px 24px; text-align: center;">
      <p style="color: #a0aec0; font-size: 12px; margin: 0;">Este es un mensaje automático.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
